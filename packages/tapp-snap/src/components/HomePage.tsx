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
import { truncateAddress, chainPipe } from "../libs/utils";
import { ADDRESSTYPE, State } from "../libs/types";
import { UNDEFINED } from "../libs/constants";

type FormProps = {
  state?: State | null;
};

export const HomePage: SnapComponent<FormProps> = ({ state }) => {
  const tokenLinks = state
    ? Object.entries(state).map(([address, tokens]) => (
        <Box key={address}>
          <Heading>Owned by {truncateAddress(address)}</Heading>
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
                {tokenId && tokenId !== UNDEFINED && (
                  <Row label="TokenId">
                    <Text>{tokenId}</Text>
                  </Row>
                )}
                <Box direction="horizontal" alignment="space-between">
                  <Button name={`viewToken_${address}_${key}`}>View</Button>
                  <Button name={`removeToken_${address}_${key}`}>Remove</Button>
                </Box>
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
    tokenLinks.push(<Button name="removeAll">Remove all</Button>);
  }

  return <Box>{tokenLinks}</Box>;
};
