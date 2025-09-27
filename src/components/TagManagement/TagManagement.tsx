import React, { useState } from 'react';
import { Tabs, Container, Title } from '@mantine/core';
import { IconTags, IconRuler, IconBrandBehance } from '@tabler/icons-react';
import TagsManagement from './TagsManagement';
import { useTagManagement } from '../../hooks/useTagManagement';

const TagManagement: React.FC = () => {
  const { tagData, brandTags, measureUnitTags, updateBrandTags, updateMeasureUnitTags } = useTagManagement();

  return (
    <Container size="lg" style={{ color: '#000' }}>
      <Title order={2} mb="lg" style={{ color: '#000' }}>Tag Management</Title>
      <Tabs defaultValue="brands">
        <Tabs.List>
          <Tabs.Tab value="brands" leftSection={<IconBrandBehance size={16} />}>
            Brand Tags
          </Tabs.Tab>
          <Tabs.Tab value="units" leftSection={<IconRuler size={16} />}>
            Measure Units
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="brands" pt="md">
          <TagsManagement
            tags={brandTags}
            onUpdate={updateBrandTags}
            title="Brand Tags"
            placeholder="Enter brand name (e.g., Premium, Organic, Local)"
            tagType="brand"
          />
        </Tabs.Panel>

        <Tabs.Panel value="units" pt="md">
          <TagsManagement
            tags={measureUnitTags}
            onUpdate={updateMeasureUnitTags}
            title="Measure Units"
            placeholder="Enter unit symbol (e.g., kg, pcs, L)"
            tagType="unit"
          />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default TagManagement;