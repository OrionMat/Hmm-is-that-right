interface MoveHistoryProps {
  moves: string[];
}

export const MoveHistory = ({ moves }: MoveHistoryProps) => {
  // Pair moves into [white, black] rows
  const rows: Array<{ moveNumber: number; white: string; black?: string }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({ moveNumber: i / 2 + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className="flex flex-col w-48 shrink-0">
      <h3 className="text-sm font-semibold text-very-dark-grey mb-2">Move History</h3>
      <div className="flex-1 overflow-y-auto max-h-[480px] border border-light-grey rounded-lg">
        {rows.length === 0 ? (
          <p className="text-xs text-very-dark-grey p-3 text-center">No moves yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-light-grey">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs text-very-dark-grey font-medium w-8">#</th>
                <th className="px-2 py-1.5 text-left text-xs text-very-dark-grey font-medium">White</th>
                <th className="px-2 py-1.5 text-left text-xs text-very-dark-grey font-medium">Black</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.moveNumber} className="border-b border-light-grey last:border-0">
                  <td className="px-2 py-1.5 text-xs text-very-dark-grey">{row.moveNumber}.</td>
                  <td className="px-2 py-1.5 font-mono text-xs text-gray-800">{row.white}</td>
                  <td className="px-2 py-1.5 font-mono text-xs text-gray-800">{row.black ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
