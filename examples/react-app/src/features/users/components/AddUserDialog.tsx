import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';

import { actions } from '@/redux';

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function AddUserDialog({ opened, onClose }: Props) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const handleSave = useCallback(() => {
    if (!name) return;

    dispatch(actions.users.createUser({ name }));
    setName('');
    onClose();
  }, [name, onClose, dispatch]);

  return (
    <Dialog.Root open={opened}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Add User</Dialog.Title>
        <Dialog.Description size="2" mb="2">
          Add a new user.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name) handleSave();
            }}
          >
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Name
              </Text>
              <TextField.Input
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          </form>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Button variant="soft" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            Save
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
