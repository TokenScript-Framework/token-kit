import type { SnapComponent } from "@metamask/snaps-sdk/jsx";
import { Box, Button, Heading, Text } from "@metamask/snaps-sdk/jsx";

type DialogProps = {
  type: string;
  title: string;
  message: string;
  actionName?: string;
};

export const Dialog: SnapComponent<DialogProps> = ({
  type,
  title,
  message,
  actionName,
}) => {
  return (
    <Box>
      <Heading>{title}</Heading>
      <Text>{message}</Text>
      {type === "confirm" && (
        <Box>
          <Box direction="horizontal" alignment="space-between">
            <Button name="cancel">Cancel</Button>
            <Button name={actionName}>Confirm</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
