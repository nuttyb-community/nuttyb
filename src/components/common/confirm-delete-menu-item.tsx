import type React from 'react';
import { useState } from 'react';

import { Menu } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { ICON_SIZE_MD } from './icon-style';

/** Red Delete menu item that asks for a second click before deleting. */
export const ConfirmDeleteMenuItem: React.FC<{ onDelete: () => void }> = ({
    onDelete,
}) => {
    // The menu unmounts its items on close, which resets the confirmation
    const [isConfirming, setConfirming] = useState(false);

    return (
        <Menu.Item
            color='red'
            leftSection={<IconTrash {...ICON_SIZE_MD} />}
            closeMenuOnClick={isConfirming}
            onClick={() => (isConfirming ? onDelete() : setConfirming(true))}
        >
            {isConfirming ? 'Click again to delete' : 'Delete'}
        </Menu.Item>
    );
};
