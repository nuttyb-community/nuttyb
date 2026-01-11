import { useMemo, useState } from 'react';

import {
    Badge,
    Group,
    Menu,
    Paper,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    UnstyledButton,
} from '@mantine/core';
import { IconArrowsSort, IconSearch } from '@tabler/icons-react';

import { FileListItem } from '@/components/tabs/editor/file-list-item';
import { SlotListItem } from '@/components/tabs/editor/slot-list-item';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SlotContent } from '@/hooks/use-slot-content';
import { EDITOR_SORT_MODE_STORAGE_KEY } from '@/lib/configuration-storage/keys';
import type { LuaFile, LuaTweakType } from '@/types/types';

import { ViewMode } from './types';

interface EditorSidebarProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    luaFiles: LuaFile[];
    slotContents: SlotContent[];
    selectedFile: string | null;
    selectedSlot: string | null;
    onSelectFile: (path: string) => void;
    onSelectSlot: (slotName: string) => void;
    isFileModified: (path: string) => boolean;
    isSlotModified: (slotName: string) => boolean;
    getSlotSize: (slotName: string) => number;
    getFileSize: (path: string) => number;
    modifiedFileCount: number;
    modifiedSlotCount: number;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
    viewMode,
    onViewModeChange,
    luaFiles,
    slotContents,
    selectedFile,
    selectedSlot,
    onSelectFile,
    onSelectSlot,
    isFileModified,
    isSlotModified,
    getSlotSize,
    getFileSize,
    modifiedFileCount,
    modifiedSlotCount,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useLocalStorage<'alphabet' | 'tweaktype'>(
        EDITOR_SORT_MODE_STORAGE_KEY,
        'alphabet'
    );

    // Determine which files are used in the configurator and map them to slots with types
    const fileToSlotsMap = useMemo(() => {
        const map = new Map<
            string,
            Array<{ slotName: string; slotType: LuaTweakType }>
        >();
        for (const slot of slotContents) {
            for (const source of slot.sources) {
                // Extract file path from source reference
                const cleanPath = source.replace(/^~/, '').split('{')[0];
                if (cleanPath.startsWith('lua/')) {
                    const existing = map.get(cleanPath) || [];
                    existing.push({
                        slotName: slot.slotName,
                        slotType: slot.type,
                    });
                    map.set(cleanPath, existing);
                }
            }
        }
        return map;
    }, [slotContents]);

    const filteredFiles = useMemo(() => {
        let files = searchQuery
            ? luaFiles.filter((file) =>
                  file.path.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : luaFiles;

        if (sortMode === 'alphabet') {
            files = [...files].toSorted((a, b) => a.path.localeCompare(b.path));
        } else if (sortMode === 'tweaktype') {
            files = [...files].toSorted((a, b) => {
                const aSlotsInfo = fileToSlotsMap.get(a.path) || [];
                const bSlotsInfo = fileToSlotsMap.get(b.path) || [];

                // Files not loaded go to the end
                if (aSlotsInfo.length === 0 && bSlotsInfo.length > 0) return 1;
                if (aSlotsInfo.length > 0 && bSlotsInfo.length === 0) return -1;
                if (aSlotsInfo.length === 0 && bSlotsInfo.length === 0)
                    return a.path.localeCompare(b.path);

                // Sort by first slot type
                const aType = aSlotsInfo[0].slotType;
                const bType = bSlotsInfo[0].slotType;

                if (aType !== bType) {
                    return aType === 'tweakdefs' ? -1 : 1;
                }

                // If same type, sort alphabetically
                return a.path.localeCompare(b.path);
            });
        }

        return files;
    }, [luaFiles, searchQuery, sortMode, fileToSlotsMap]);

    const filteredSlots = useMemo(() => {
        if (!searchQuery) return slotContents;
        const query = searchQuery.toLowerCase();
        return slotContents.filter(
            (slot) =>
                slot.slotName.toLowerCase().includes(query) ||
                slot.sources.some((s) => s.toLowerCase().includes(query))
        );
    }, [slotContents, searchQuery]);

    // Pre-calculate all file sizes to avoid recalculating on every render
    const fileSizes = useMemo(() => {
        const sizes = new Map<string, number>();
        for (const file of filteredFiles) {
            sizes.set(file.path, getFileSize(file.path));
        }
        return sizes;
    }, [filteredFiles, getFileSize]);

    // Pre-calculate all slot sizes to avoid recalculating on every render
    const slotSizes = useMemo(() => {
        const sizes = new Map<string, number>();
        for (const slot of filteredSlots) {
            sizes.set(slot.slotName, getSlotSize(slot.slotName));
        }
        return sizes;
    }, [filteredSlots, getSlotSize]);

    return (
        <Paper withBorder p='sm' style={{ width: 280, flexShrink: 0 }}>
            <Stack gap='sm' style={{ height: '100%' }}>
                <SegmentedControl
                    size='xs'
                    value={viewMode}
                    onChange={(value) => onViewModeChange(value as ViewMode)}
                    data={[
                        { label: 'Source Files', value: 'sources' },
                        { label: 'Slot Content', value: 'slots' },
                    ]}
                />

                <Group justify='space-between'>
                    <Group gap='xs'>
                        <Text fw={600} size='sm'>
                            {viewMode === 'sources' ? 'Files' : 'Slots'}
                        </Text>
                        {viewMode === 'sources' && (
                            <Menu position='bottom-start' shadow='md'>
                                <Menu.Target>
                                    <UnstyledButton aria-label='Sort files'>
                                        <IconArrowsSort
                                            size={14}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </UnstyledButton>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        onClick={() => setSortMode('alphabet')}
                                    >
                                        Alphabet
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => setSortMode('tweaktype')}
                                    >
                                        Tweak Type
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    </Group>
                    {viewMode === 'sources' && modifiedFileCount > 0 && (
                        <Badge size='sm' color='yellow'>
                            {modifiedFileCount} modified
                        </Badge>
                    )}
                    {viewMode === 'slots' && modifiedSlotCount > 0 && (
                        <Badge size='sm' color='yellow'>
                            {modifiedSlotCount} modified
                        </Badge>
                    )}
                </Group>

                <TextInput
                    placeholder={
                        viewMode === 'sources'
                            ? 'Search files...'
                            : 'Search slots...'
                    }
                    size='xs'
                    leftSection={<IconSearch size={14} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />

                <ScrollArea style={{ flex: 1 }}>
                    <Stack gap={2}>
                        {viewMode === 'sources'
                            ? filteredFiles.map((file) => (
                                  <FileListItem
                                      key={file.path}
                                      fileName={
                                          file.path.split('/').pop() ??
                                          file.path
                                      }
                                      isSelected={selectedFile === file.path}
                                      isModified={isFileModified(file.path)}
                                      loadedInSlots={
                                          fileToSlotsMap.get(file.path) || []
                                      }
                                      fileSize={fileSizes.get(file.path) ?? 0}
                                      onClick={() => onSelectFile(file.path)}
                                  />
                              ))
                            : filteredSlots.map((slot) => (
                                  <SlotListItem
                                      key={slot.slotName}
                                      slotName={slot.slotName}
                                      slotType={slot.type}
                                      sources={slot.sources}
                                      isSelected={
                                          selectedSlot === slot.slotName
                                      }
                                      isModified={isSlotModified(slot.slotName)}
                                      slotSize={
                                          slotSizes.get(slot.slotName) ?? 0
                                      }
                                      onClick={() =>
                                          onSelectSlot(slot.slotName)
                                      }
                                  />
                              ))}
                    </Stack>
                </ScrollArea>
            </Stack>
        </Paper>
    );
};
