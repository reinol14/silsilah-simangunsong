type Props = {
  data: {
    columns: string[]
    rows: (string | number)[][]
  }
}

export function SilsilahTable({ data }: Props) {
  return (
    <table className="border w-full text-sm">
      <thead className="bg-gray-100">
        <tr>
          {data.columns.map(col => (
            <th key={col} className="border px-2 py-1">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border px-2 py-1">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}