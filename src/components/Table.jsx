import { useState, useEffect } from "react";
import {
  AArrowUp,
  AArrowDown,
  ArrowUp,
  ArrowDown,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
} from "lucide-react";

const TableCol = ({ children, className }) => (
  <td className={`py-2 px-3 text-left ${className}`}>{children}</td>
);
const TableRow = ({ children, className }) => (
  <tr className={`bg-gray-600 ${className}`}>{children}</tr>
);
const TableHeader = ({ children, onClick, className }) => (
  <th className={`cursor-pointer text-left ${className}`} onClick={onClick}>
    {children}
  </th>
);

const Table = ({
  columns = [
    {
      title: "",
      dataIndex: "",
      render: (val, record, index) => val,
      sort: (a, b) => (a > b ? 1 : -1),
    },
  ],
  data = [],
  pagination = false,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  onLimitChange,
  classNames = {
    table: "",
    td: "",
    tr: "",
    th: "",
  },
}) => {
  const [sourceData, setSourceData] = useState(data);
  const [currPage, setCurrPage] = useState(currentPage);
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    setSourceData(data);
  }, [data]);

  const handleSort = (col) => {
    if (!col.sort) return;
    let sortedData = [...sourceData];

    if (sortConfig?.key === col.dataIndex && sortConfig?.order === "asc") {
      sortedData.sort((a, b) => col.sort(b[col.dataIndex], a[col.dataIndex]));
      setSortConfig({ key: col.dataIndex, order: "desc" });
    } else {
      sortedData.sort((a, b) => col.sort(a[col.dataIndex], b[col.dataIndex]));
      setSortConfig({ key: col.dataIndex, order: "asc" });
    }

    setSourceData(sortedData);
  };

  const handlePageChange = (page) => {
    setCurrPage(page);
    if (onPageChange) onPageChange(page);
  };

  return (
    <div>
      <table
        className={`w-full border-collapse border border-gray-300 ${classNames.table}`}
      >
        <thead>
          <TableRow className={classNames.tr}>
            {columns.map((c, i) => (
              <TableHeader
                key={i}
                onClick={() => handleSort(c)}
                className={classNames.th}
              >
                <div className="flex flex-row items-center gap-2">
                  <span>{c.title}</span>
                  <span>
                    {sortConfig?.key === c.dataIndex &&
                      (sortConfig.order === "asc" ? (
                        <ArrowUpWideNarrow size={18} />
                      ) : (
                        <ArrowDownWideNarrow size={18} />
                      ))}
                  </span>
                </div>
              </TableHeader>
            ))}
          </TableRow>
        </thead>
        <tbody>
          {sourceData.length > 0 ? (
            sourceData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={classNames.tr}>
                {columns.map((col, colIndex) => (
                  <TableCol key={colIndex} className={classNames.td}>
                    {col.render
                      ? col.render(row[col.dataIndex], row, rowIndex)
                      : row[col.dataIndex]}
                  </TableCol>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className={classNames.tr}>
              <TableCol
                colSpan={columns.length}
                className={`text-center py-2 ${classNames.td}`}
              >
                No Data
              </TableCol>
            </TableRow>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between mt-3">
          <div>
            <button
              disabled={currPage === 1}
              onClick={() => handlePageChange(currPage - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4">
              Page {currPage} of {totalPages}
            </span>
            <button
              disabled={currPage === totalPages}
              onClick={() => handlePageChange(currPage + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          {onLimitChange && (
            <select
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="ml-4 border px-2 py-1 rounded"
            >
              {[5, 10, 20, 50].map((limit) => (
                <option key={limit} value={limit}>
                  {limit} / page
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
};

export default Table;
