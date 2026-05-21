/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 响应式表格组件 - 桌面端表格/移动端卡片双布局
 * 依赖关系: Tailwind CSS (CSS-based responsive, no JS detection)
 * 变更同步:
 *   - 新增表格场景时，需添加对应的 column 配置
 *   - 设计系统变化时，需更新样式
 * ============================================================================
 */

'use client';

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  mobileLabel?: string; // Optional shorter label for mobile
  mobilePriority?: 'high' | 'medium' | 'low'; // Priority for mobile display
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  // For mobile cards
  cardTitle?: (item: T) => React.ReactNode;
  cardActions?: (item: T) => React.ReactNode;
}

export function ResponsiveTable<T extends { id: number | string }>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data found',
  isLoading = false,
  loadingComponent,
  cardTitle,
  cardActions,
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return loadingComponent || (
      <div className="flex justify-center p-8">
        <div className="animate-pulse h-8 w-8 rounded-full bg-gray-200" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-[#5C7064] text-sm p-8">
        {emptyMessage}
      </div>
    );
  }

  // Render both layouts, CSS handles visibility
  return (
    <>
      {/* Mobile: Card List Layout - visible below md breakpoint */}
      <div className="flex flex-col gap-3 md:hidden">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 p-4 bg-white border border-[#D3DED8] rounded-md"
            onClick={() => onRowClick?.(item)}
          >
            {/* Card Header - Title + Actions */}
            {(cardTitle || cardActions) && (
              <div className="flex items-start justify-between gap-2">
                {cardTitle && (
                  <div className="font-medium text-[#1D3025] text-base">
                    {cardTitle(item)}
                  </div>
                )}
                {cardActions && (
                  <div className="flex items-center gap-2 shrink-0">
                    {cardActions(item)}
                  </div>
                )}
              </div>
            )}

            {/* Card Content - Key Value pairs */}
            <div className="flex flex-col gap-2">
              {columns
                .filter(col => col.mobilePriority !== 'low' || !col.mobilePriority)
                .map((col) => (
                  <div key={col.key} className="flex items-start gap-2">
                    <span className="text-[#5C7064] text-xs min-w-[80px] shrink-0">
                      {col.mobileLabel || col.label}
                    </span>
                    <span className="text-[#1D3025] text-sm">
                      {col.render(item)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout - hidden below md breakpoint */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#D3DED8]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="h-10 px-2 text-left text-sm font-medium text-[#1D3025] whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-[#D3DED8] ${index === data.length - 1 ? 'border-0' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-2 text-sm text-[#1D3025]">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}