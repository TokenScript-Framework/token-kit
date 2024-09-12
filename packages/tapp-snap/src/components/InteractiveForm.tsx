import type { SnapComponent } from "@metamask/snaps-sdk/jsx";
import {
  Box,
  Heading,
  Image,
  Text,
  Row,
  Divider,
  Link,
} from "@metamask/snaps-sdk/jsx";

import { VIEWER_ROOT } from "../libs/utils";
import { Metadata } from "../libs/types";

type FormProps = {
  metadata?: Metadata;
  chain: string;
  contract: string;
  tokenId: string;
};

export const InteractiveForm: SnapComponent<FormProps> = ({
  metadata,
  chain,
  contract,
  tokenId,
}) => {
  if (!metadata) {
    return <Text>Metadata is wrong</Text>;
  }

  const actionLinks = [];
  for (let i = 0; i < metadata.actions.length; i += 2) {
    actionLinks.push(
      <Box key={`box-${i}`} direction="horizontal" alignment="space-between">
        <Text>
          <Link
            href={`${VIEWER_ROOT}/?chain=${chain}&contract=${contract}#card=${metadata.actions[i]}&tokenId=${tokenId}`}
          >
            {metadata.actions[i]?.toUpperCase()}
          </Link>
        </Text>
        {metadata.actions[i + 1] && (
          <Text>
            <Link
              href={`${VIEWER_ROOT}/?chain=${chain}&contract=${contract}#card=${metadata.actions[i + 1]}&tokenId=${tokenId}`}
            >
              {metadata.actions[i + 1]?.toUpperCase()}
            </Link>
          </Text>
        )}
      </Box>,
    );
  }

  return (
    <Box>
      <Heading>#{tokenId}</Heading>
      <Divider />
      <Image src={metadata.tokenMetadata.svg} />
      <Divider />
      {metadata.tokenMetadata.attributes.map(({ trait_type, value }) => (
        <Row label={trait_type}>
          <Text>{value.toString()}</Text>
        </Row>
      ))}

      <Divider />
      <Heading>Actions</Heading>

      {actionLinks.map(
        (actionLink, index) =>
          actionLink && <Box key={`action-link-${index}`}>{actionLink}</Box>,
      )}

      {actionLinks.length === 0 && <Text>No actions</Text>}
    </Box>
  );
};
