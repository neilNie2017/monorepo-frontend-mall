/**
 * ProTable 通用表格组件(参考 ProComponents 的 ProTable)
 *
 * 结构自上而下三块卡片, 卡片间距 16px(mb:2):
 *   1. 过滤区: 由 columns 中未标记 hideInSearch 的项自动生成
 *   2. 操作区: 左侧显示数据总数(数字加粗), 右侧为 toolbar 传入的操作按钮
 *   3. 表格区: 由 columns 中未标记 hideInTable 的项自动生成 + 分页
 *
 * columns 配置项:
 *   title        {string}   列标题, 同时作为过滤区标签
 *   dataIndex    {string}   字段名(支持 "a.b" 深层取值)
 *   valueType    {'text'|'number'|'select'} 默认 text
 *   hideInSearch {boolean}  为 true 时不在过滤区显示
 *   hideInTable  {boolean}  为 true 时不在表格显示
 *   searchKey    {string}   过滤提交时的参数名, 默认取 dataIndex
 *   options      {Array<{label, value}>}  valueType=select 时的选项
 *   initialValue {*}        过滤项初始值
 *   align        {'left'|'right'|'center'}
 *   width        {number|string}
 *   render       {(value, record, index) => ReactNode} 自定义单元格内容
 */
import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import { Input } from "@components";

const CARD_SX = {
  borderRadius: 2,
  boxShadow: "0 1px 3px rgba(15,23,42,.06)",
};

/** 按 dataIndex 取原始值, 支持 "a.b" 深层取值 */
const getRawValue = (record, dataIndex) =>
  dataIndex.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), record);

/** 文本值统一给个空态 */
const isEmpty = (v) => v === null || v === undefined || v === "";

/** 按 valueType 渲染只读展示值(默认 text) */
function renderCell(column, value, record, index) {
  if (column.render) return column.render(value, record, index);
  if (isEmpty(value)) return "-";
  switch (column.valueType) {
    case "number": {
      const n = Number(value);
      return Number.isNaN(n) ? "-" : n.toLocaleString();
    }
    case "select": {
      const hit = (column.options || []).find(
        (o) => String(o.value) === String(value)
      );
      return hit ? hit.label : "-";
    }
    default:
      return String(value);
  }
}

export default function ProTable({
  columns = [],
  data = [],
  loading = false,
  total = 0,
  page = 0,
  pageSize = 10,
  rowKey = "id",
  toolbar = null,
  onSearch,
  onPageChange,
  onPageSizeChange,
}) {
  const searchColumns = useMemo(
    () => columns.filter((c) => !c.hideInSearch),
    [columns]
  );
  const tableColumns = useMemo(
    () => columns.filter((c) => !c.hideInTable),
    [columns]
  );

  const buildInitial = () => {
    const init = {};
    searchColumns.forEach((c) => {
      init[c.searchKey || c.dataIndex] = c.initialValue ?? "";
    });
    return init;
  };

  const [values, setValues] = useState(buildInitial);

  const setField = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  const handleSearch = () => onSearch?.(values);

  const handleReset = () => {
    const init = buildInitial();
    setValues(init);
    onSearch?.(init);
  };

  const resolveRowKey = (record, index) =>
    typeof rowKey === "function" ? rowKey(record, index) : record[rowKey] ?? index;

  const count = Number(total) || data.length;

  return (
    <>
      {/* 过滤区 */}
      {searchColumns.length > 0 && (
        <Card sx={{ ...CARD_SX, mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              {searchColumns.map((c) => {
                const key = c.searchKey || c.dataIndex;
                if (c.valueType === "select") {
                  return (
                    <Box key={key} sx={{ width: 160 }}>
                      <Input
                        label={c.title}
                        select
                        size="small"
                        value={values[key] ?? ""}
                        onChange={(e) => setField(key, e.target.value)}
                        margin="dense"
                        SelectProps={{
                          native: true,
                          children: [
                            <option key="__all" value="">
                              全部
                            </option>,
                            ...(c.options || []).map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            )),
                          ],
                        }}
                      />
                    </Box>
                  );
                }
                return (
                  <Box key={key} sx={{ flex: "1 1 240px", maxWidth: 320 }}>
                    <Input
                      label={c.title}
                      size="small"
                      placeholder={`输入${c.title}`}
                      value={values[key] ?? ""}
                      onChange={(e) => setField(key, e.target.value)}
                      margin="dense"
                    />
                  </Box>
                );
              })}
              <Button variant="contained" onClick={handleSearch}>
                搜索
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                重置
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 操作区 */}
      <Card sx={{ ...CARD_SX, mb: 2 }}>
        <CardContent
          sx={{
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            共{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {count}
            </Box>{" "}
            条数据
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>{toolbar}</Box>
        </CardContent>
      </Card>

      {/* 表格区 */}
      <Card sx={CARD_SX}>
        <CardContent sx={{ p: 2.5 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {tableColumns.map((c) => (
                    <TableCell
                      key={c.dataIndex}
                      align={c.align || "left"}
                      sx={{ width: c.width }}
                    >
                      {c.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((record, index) => (
                  <TableRow key={resolveRowKey(record, index)} hover>
                    {tableColumns.map((c) => (
                      <TableCell key={c.dataIndex} align={c.align || "left"}>
                        {renderCell(
                          c,
                          getRawValue(record, c.dataIndex),
                          record,
                          index
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {!loading && data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      align="center"
                      sx={{ py: 6, color: "text.disabled" }}
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={(_, p) => onPageChange?.(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              onPageSizeChange?.(Number(e.target.value));
              onPageChange?.(0);
            }}
            labelRowsPerPage="每页"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / 共 ${count}`
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
