import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-blue-200 mb-4">404</p>
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="border border-blue-700 text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;