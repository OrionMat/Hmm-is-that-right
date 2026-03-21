import { NewsPiece } from "../dataModel/dataModel";
import { SelectNewsIcon } from "../icons/NewsIcons";

interface ResultsTableProps {
  newsPieces: NewsPiece[];
}

export const ResultsTable = ({ newsPieces }: ResultsTableProps) => {
  return (
    <table className="w-3/4 mt-6">
      <thead className="sr-only">
        <tr>
          <th scope="col">Source</th>
          <th scope="col">Title</th>
          <th scope="col">Body</th>
          <th scope="col">Date</th>
        </tr>
      </thead>
      <tbody>
        {newsPieces.map((newsPiece) => (
          <tr
            key={newsPiece.url}
            className="rounded-sm shadow-[0_1px_6px_-1px_var(--color-dark-grey)]"
          >
            <td className="p-5">
              <div className="min-w-0">
                <SelectNewsIcon source={newsPiece.source} isActive={true} />
              </div>
            </td>
            <td className="p-5">
              <div className="min-w-[300px] text-justify line-clamp-6">
                <a href={newsPiece.url}>{newsPiece.title}</a>
              </div>
            </td>
            <td className="p-5">
              <div className="min-w-[250px] text-justify line-clamp-6 max-w-max whitespace-pre-wrap">
                {newsPiece.body.filter(Boolean).join("\n")}
              </div>
            </td>
            <td className="p-5">
              <div className="min-w-[250px] text-justify line-clamp-6">
                {newsPiece.date}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
