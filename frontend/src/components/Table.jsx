function Table({ columns, data, renderActions }) {
  if (!data || data.length === 0) {
    return <p style={{ padding: "16px", color: "#666" }}>No hay datos para mostrar.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
      <thead>
        <tr style={{ backgroundColor: "#e5e7eb", textAlign: "left" }}>
          {columns.map((col) => (
            <th key={col.key} style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>
              {col.label}
            </th>
          ))}
          {renderActions && (
            <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Acciones</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
            {columns.map((col) => (
              <td key={col.key} style={{ padding: "10px" }}>
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
            {renderActions && <td style={{ padding: "10px" }}>{renderActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;