import { useFieldSchema } from '@formily/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SchemaInitializerChildren } from '../../application';
import { SchemaInitializer } from '../../application/schema-initializer/SchemaInitializer';
import { useCompile } from '../../schema-component';
import {
  useAssociatedTableColumnInitializerFields,
  useInheritsTableColumnInitializerFields,
  useTableColumnInitializerFields,
} from '../utils';

// 表格列配置
const ParentCollectionFields = () => {
  const inheritFields = useInheritsTableColumnInitializerFields();
  const { t } = useTranslation();
  const compile = useCompile();
  if (!inheritFields?.length) return null;
  const res = [];
  inheritFields.forEach((inherit) => {
    Object.values(inherit)[0].length &&
      res.push({
        type: 'itemGroup',
        divider: true,
        title: t(`Parent collection fields`) + '(' + compile(`${Object.keys(inherit)[0]}`) + ')',
        children: Object.values(inherit)[0].filter((v: any) => !v?.field?.isForeignKey),
      });
  });
  return <SchemaInitializerChildren>{res}</SchemaInitializerChildren>;
};

const AssociatedFields = () => {
  const associatedFields = useAssociatedTableColumnInitializerFields();
  const fieldSchema = useFieldSchema();
  const { t } = useTranslation();
  const schema: any = useMemo(
    () => [
      {
        type: 'itemGroup',
        title: t('Display association fields'),
        children: associatedFields,
      },
    ],
    [associatedFields, t],
  );
  if (!associatedFields?.length || fieldSchema['x-component'] === 'AssociationField.SubTable') return null;
  return <SchemaInitializerChildren>{schema}</SchemaInitializerChildren>;
};

export const tableColumnInitializers = new SchemaInitializer({
  name: 'TableColumnInitializers',
  insertPosition: 'beforeEnd',
  icon: 'SettingOutlined',
  title: '{{t("Configure columns")}}',
  wrap: (s) => {
    if (s['x-action-column']) {
      return s;
    }
    return {
      type: 'void',
      'x-decorator': 'TableV2.Column.Decorator',
      'x-designer': 'TableV2.Column.Designer',
      'x-component': 'TableV2.Column',
      properties: {
        [s.name]: {
          ...s,
        },
      },
    };
  },
  items: [
    {
      name: 'displayFields',
      type: 'itemGroup',
      title: '{{t("Display fields")}}',
      // children: DisplayFields,
      useChildren: useTableColumnInitializerFields,
    },
    {
      name: 'parentCollectionFields',
      Component: ParentCollectionFields,
    },
    {
      name: 'associationFields',
      Component: AssociatedFields,
    },
    {
      name: 'divider',
      type: 'divider',
      useVisible() {
        const fieldSchema = useFieldSchema();
        return fieldSchema['x-component'] !== 'AssociationField.SubTable';
      },
    },
    {
      type: 'item',
      name: 'add',
      title: '{{t("Action column")}}',
      Component: 'TableActionColumnInitializer',
      useVisible() {
        const fieldSchema = useFieldSchema();
        return fieldSchema['x-component'] !== 'AssociationField.SubTable';
      },
    },
  ],
});
