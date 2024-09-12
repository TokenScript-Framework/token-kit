import type { SnapComponent } from "@metamask/snaps-sdk/jsx";
import {
  Button,
  Box,
  Heading,
  Text,
  Row,
  Divider,
  Link,
  Address,
} from "@metamask/snaps-sdk/jsx";
import { addressPipe, chainPipe } from "../libs/utils";
import { ADDRESSTYPE, State } from "../libs/types";

type FormProps = {
  state?: State | null;
};

export const HomeForm: SnapComponent<FormProps> = ({ state }) => {
  const tokenLinks = state
    ? Object.entries(state).map(([address, tokens]) => (
        <Box key={address}>
          <Heading>Owned by {addressPipe(address)}</Heading>
          <Divider />
          {Object.entries(tokens).map(([key, token]) => {
            const [chainId, contractAddress, tokenId] = key.split("-");
            return (
              <Box key={key}>
                <Box direction="horizontal" alignment="space-between">
                  <Text>{chainPipe(Number(chainId))}</Text>
                  <Link href={token.aboutUrl}>{token.name}</Link>
                </Box>
                <Row label="Contract">
                  <Address address={contractAddress as ADDRESSTYPE} />
                </Row>
                <Row label="TokenId">
                  <Text>{tokenId}</Text>
                </Row>
                <Button name={`viewToken_${address}_${key}`}>View</Button>
                <Divider />
              </Box>
            );
          })}
        </Box>
      ))
    : [];

  if (tokenLinks.length === 0) {
    tokenLinks.push(<Text key="no-token">No token</Text>);
  } else {
    tokenLinks.push(
      <Button key="clear" name="clear">
        Clear
      </Button>,
    );
  }

  return <Box>{tokenLinks}</Box>;
};
