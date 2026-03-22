import React , {useState} from 'react'

function Forms() {
      // 1. Create state to hold the live input value
  const [inputValue, setInputValue] = useState('');

  // 2. The event handler for the button click
  const handleAlert = () => {
    if (inputValue.trim() === '') {
      alert("Please type something first!");
    } else {
      alert(`User entered: ${inputValue}`);
    }
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Input Tracker
        </h2>
        
        <div className="space-y-4">
          {/* 3. The Input Field: value is linked to state */}
          <input
            type="text"
            placeholder="Type something here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />

          {/* 4. The Button: triggers the alert */}
          <button
            onClick={handleAlert}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md"
          >
            Show Alert
          </button>
        </div>

        {/* Live Preview (Optional practice) */}
        <p className="mt-4 text-sm text-gray-500 italic text-center">
          Current state: <span className="font-mono text-blue-600">{inputValue || "(empty)"}</span>
        </p>
      </div>
    </div>

    </>
  )
}

export default Forms