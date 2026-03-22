import { Link, Outlet, useMatch } from "react-router-dom";
import { PageContainer } from "../../components/PageContainer";
import { PageNames } from "../PageNames";

interface FeatureCardProps {
  to: string;
  title: string;
  description: string;
  icon: string;
}

const FeatureCard = ({ to, title, description, icon }: FeatureCardProps) => (
  <Link
    to={to}
    className="flex flex-col gap-3 bg-white rounded-xl shadow-md border border-light-grey p-8 hover:shadow-lg hover:border-link transition-all duration-200 group"
  >
    <span className="text-4xl">{icon}</span>
    <h2 className="text-xl font-semibold text-gray-800 group-hover:text-link transition-colors">
      {title}
    </h2>
    <p className="text-sm text-very-dark-grey leading-relaxed">{description}</p>
    <span className="mt-auto text-sm font-medium text-link">
      Get started →
    </span>
  </Link>
);

export const AcademicsHub = () => {
  const isIndex = useMatch(`/${PageNames.academics}`);

  if (isIndex) {
    return (
      <PageContainer>
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Academics</h1>
          <p className="text-very-dark-grey mb-8">
            Test your knowledge or sharpen your chess game.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <FeatureCard
              to={`/${PageNames.academics}/${PageNames.academicsQuiz}`}
              title="Quiz"
              description="Answer AI-generated multiple-choice questions on media literacy and critical thinking."
              icon="🧠"
            />
            <FeatureCard
              to={`/${PageNames.academics}/${PageNames.academicsChess}`}
              title="Chess"
              description="Play a game of chess against yourself. Practice openings, analyse positions, or just play."
              icon="♟"
            />
          </div>
        </div>
      </PageContainer>
    );
  }

  return <Outlet />;
};
