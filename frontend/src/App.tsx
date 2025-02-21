import "./App.css";

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Hello Tailwind!
        </h1>
        <p className="text-gray-600 hover:text-gray-800">
          If you see this text styled and changing color on hover, Tailwind is
          working!
        </p>
      </div>
    </div>
  );
}

export default App;
