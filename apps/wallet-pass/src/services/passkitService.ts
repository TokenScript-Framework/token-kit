import * as apn from 'apn';
import {and, desc, eq, gt, inArray, isNull} from 'drizzle-orm';
import {DbService} from '../_core/services/dbService';
import {devices} from '../schemas/devices';
import {passes} from '../schemas/passes';
import {registrations} from '../schemas/registrations';
import {ProjectConfig} from './projectService';

export async function registerApple(
  dbService: DbService,
  passId: string,
  platform: string,
  deviceLibraryIdentifier: string,
  pushToken: string
) {
  return await dbService.db().transaction(async tx => {
    await tx
      .insert(devices)
      .values({
        deviceLibraryIdentifier,
        pushToken,
        platform,
      })
      .onConflictDoNothing();

    const device = await tx
      .select({id: devices.id})
      .from(devices)
      .where(
        and(
          eq(devices.platform, platform),
          eq(devices.deviceLibraryIdentifier, deviceLibraryIdentifier)
        )
      )
      .limit(1);

    // Check whether the device and pass pair already has active registration
    let registration = await tx
      .select({
        id: registrations.id,
      })
      .from(registrations)
      .where(
        and(
          eq(registrations.passId, passId),
          eq(registrations.deviceId, device[0].id),
          isNull(registrations.deletedAt)
        )
      )
      .limit(1);

    // Create active registration if not already existing
    if (registration.length === 0) {
      registration = await tx
        .insert(registrations)
        .values({
          passId,
          deviceId: device[0].id,
        })
        .returning({
          id: registrations.id,
        });
    }

    return registration[0];
  });
}

const apnProviderCache: {
  [passTypeIdentifier: string]: apn.Provider;
} = {};

function findApnProvider(config: ProjectConfig) {
  const {key, cert, keySecret, passTypeIdentifier} = config.walletPass!.apple!;

  if (apnProviderCache[passTypeIdentifier])
    return apnProviderCache[passTypeIdentifier];

  const apnProvider = new apn.Provider({
    key,
    cert,
    passphrase: keySecret,
    production: true,
  });
  apnProviderCache[passTypeIdentifier] = apnProvider;

  return apnProvider;
}

export async function notifyAppleDevice(
  dbService: DbService,
  config: ProjectConfig,
  passId: string
) {
  const devices = await getActiveDevicesByPassId(dbService, passId);
  if (devices.length === 0) return;

  const pushTokens = devices.map(device => device.pushToken);
  const apnProvider = findApnProvider(config);

  const note = new apn.Notification();
  note.expiry = Math.floor(Date.now() / 1000) + 3600 * 24 * 3; // Expires 3 days from now.
  note.payload = {};

  const {failed} = await apnProvider.send(note, pushTokens);
  // Apple dev doc suggest to remove the invalid pushToken if APN return 410 (unregistered / expired)
  // the result schema can be found at https://github.com/node-apn/node-apn/blob/master/doc/provider.markdown#failed
  if (failed?.length > 0) {
    const regIdsToDelete = [];
    for (const failure of failed) {
      if (failure.status === '410') {
        const failedDevice = devices.find(d => d.pushToken === failure.device);
        if (failedDevice) regIdsToDelete.push(failedDevice.id);
      }
    }

    if (regIdsToDelete.length > 0) {
      await unregisterApple(dbService, regIdsToDelete);
    }
  }
}

export async function unregisterApple(dbService: DbService, ids: string[]) {
  return await dbService
    .db()
    .update(registrations)
    .set({deletedAt: new Date()})
    .where(inArray(registrations.id, ids));
}

export async function getActiveDevicesByPassId(
  dbService: DbService,
  passId: string
) {
  return await dbService
    .db()
    .select({
      id: devices.id,
      deviceLibraryIdentifier: devices.deviceLibraryIdentifier,
      pushToken: devices.pushToken,
    })
    .from(devices)
    .innerJoin(registrations, eq(registrations.deviceId, devices.id))
    .innerJoin(passes, eq(registrations.passId, passId))
    .where(and(eq(passes.id, passId), isNull(registrations.deletedAt)));
}

export async function getActiveRegistrationByVendorIdentifier(
  dbService: DbService,
  devicePlatform: string,
  deviceLibraryIdentifier: string,
  passPlatform: string,
  passTypeIdentifier: string,
  serialNumber: string
) {
  const results = await dbService
    .db()
    .select({
      id: passes.id,
      platform: passes.platform,
      apiKey: passes.apiKey,
      regId: registrations.id,
    })
    .from(registrations)
    .innerJoin(passes, eq(registrations.passId, passes.id))
    .innerJoin(devices, eq(registrations.deviceId, devices.id))
    .where(
      and(
        eq(devices.platform, devicePlatform),
        eq(devices.deviceLibraryIdentifier, deviceLibraryIdentifier),
        eq(passes.platform, passPlatform),
        eq(passes.passTypeIdentifier, passTypeIdentifier),
        eq(passes.serialNumber, serialNumber),
        isNull(registrations.deletedAt)
      )
    )
    .limit(1);

  return results.length ? results[0] : undefined;
}

export async function findUpdatedPasses(
  dbService: DbService,
  platform: string,
  deviceLibraryIdentifier: string,
  passTypeIdentifier: string,
  previousUpdated: Date
) {
  const results = await dbService
    .db()
    .select({
      serialNumber: passes.serialNumber,
      updatedAt: passes.updatedAt,
    })
    .from(passes)
    .innerJoin(registrations, eq(passes.id, registrations.passId))
    .innerJoin(devices, eq(registrations.deviceId, devices.id))
    .where(
      and(
        eq(devices.platform, platform),
        eq(devices.deviceLibraryIdentifier, deviceLibraryIdentifier),
        eq(passes.passTypeIdentifier, passTypeIdentifier),
        gt(passes.updatedAt, previousUpdated),
        isNull(registrations.deletedAt)
      )
    )
    .orderBy(desc(passes.updatedAt));

  if (results.length > 0) {
    return {
      serialNumbers: results.map(pass => pass.serialNumber),
      lastUpdated: Math.round(
        results[0].updatedAt!.getTime() / 1000
      ).toString(),
    };
  }
  return;
}
