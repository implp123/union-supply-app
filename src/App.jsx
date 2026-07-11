import React, { useState, useMemo } from 'react';

const CURRENT_ITEMS = [
  "BBQ SAUCE", "BROWN SUGAR", "BUTTER", "CANE SUGAR", "COFFEE",
  "COFFEE - POWDERED CREAMER", "GARLIC POWDER", "HOT CHOCOLATE",
  "HOT SAUCE", "ITALIAN SALAD DRESSING", "JELLY", "KETCHUP",
  "MAYONAISE", "MUSTARD", "OATMEAL", "OIL SPRAY", "OLIVE OIL",
  "PANCAKE MIX", "PEANUT BUTTER - CRUNCHY", "PEANUT BUTTER - SMOOTH", 
  "PEPPER", "RANCH DRESSING", "SALSA", "SALT", "SEASONING SALT",
  "SOY SAUCE", "SYRUP"
];

// Rotating color palette for the supply item boxes to improve readability
const CARD_COLORS = [
  'bg-blue-50 border-blue-200',
  'bg-emerald-50 border-emerald-200',
  'bg-amber-50 border-amber-200',
  'bg-purple-50 border-purple-200',
  'bg-rose-50 border-rose-200',
  'bg-cyan-50 border-cyan-200'
];

export default function UnionShoppingApp() {
  const [view, setView] = useState('vote');
  
  const [userName, setUserName] = useState('');
  const [votes, setVotes] = useState({});
  const [newItemInput, setNewItemInput] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allSubmissions, setAllSubmissions] = useState([]);
  const [allSuggestions, setAllSuggestions] = useState([]);

  const handleVote = (item, choice) => {
    setVotes(prev => ({ ...prev, [item]: choice }));
  };

  const handleAddSuggestion = (e) => {
    e.preventDefault();
    if (!newItemInput.trim() || !userName.trim()) return alert("Please enter your name first!");
    
    setUserSuggestions(prev => [...prev, newItemInput.trim()]);
    setNewItemInput('');
  };

  const handleSubmitBallot = async () => {
    if (!userName.trim()) return alert("Name is required!");
    
    setIsSubmitting(true);
    const formattedSuggestions = userSuggestions.join(", ");

    const payload = {
      data: [
        {
          Name: userName,
          ...votes, 
          New_Suggestions: formattedSuggestions
        }
      ]
    };

    try {
      // IMPORTANT: Paste your actual SheetDB API URL with ?sheet=Sheet2 inside the quotes!
      const response = await fetch('https://sheetdb.io/api/v1/wo4xfh7hnwh32?sheet=Sheet2', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setAllSubmissions(prev => [...prev, { name: userName, votes }]);
        const formattedLocalSuggestions = userSuggestions.map(item => ({
          user: userName,
          item: item.toUpperCase()
        }));
        setAllSuggestions(prev => [...prev, ...formattedLocalSuggestions]);

        alert(`Thank you, ${userName}! Your ballot has been recorded.`);
        setUserName('');
        setVotes({});
        setUserSuggestions([]);
        setView('results');
      } else {
        alert("There was an error saving your ballot. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting ballot:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteTallies = useMemo(() => {
    const tallies = {};
    CURRENT_ITEMS.forEach(item => tallies[item] = { keep: 0, drop: 0 });

    allSubmissions.forEach(submission => {
      Object.entries(submission.votes).forEach(([item, choice]) => {
        if (choice === 'keep') tallies[item].keep += 1;
        if (choice === 'drop') tallies[item].drop += 1;
      });
    });
    return tallies;
  }, [allSubmissions]);

  const sortedSuggestions = useMemo(() => {
    return [...allSuggestions].sort((a, b) => a.item.localeCompare(b.item));
  }, [allSuggestions]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-2 sm:p-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Navigation */}
        <div className="flex border-b bg-gray-50">
          <button 
            onClick={() => setView('vote')}
            className={`flex-1 py-4 text-center font-extrabold text-lg transition-colors ${view === 'vote' ? 'bg-slate-800 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Submit Ballot
          </button>
          <button 
            onClick={() => setView('results')}
            className={`flex-1 py-4 text-center font-extrabold text-lg transition-colors ${view === 'results' ? 'bg-slate-800 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Compiled Results
          </button>
        </div>

        {/* --- VIEW: VOTING --- */}
        {view === 'vote' && (
          <div className="p-4 sm:p-6">
            <h2 className="text-3xl font-black mb-6 text-slate-800 tracking-tight">Supply Review</h2>
            
            <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-slate-600">Member Name</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name" 
                className="w-full p-4 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="mb-10 space-y-4">
              <h3 className="text-xl font-bold text-slate-700 mb-4 border-b-2 pb-2">Current Shopping List</h3>
              
              {CURRENT_ITEMS.map((item, index) => {
                const colorClass = CARD_COLORS[index % CARD_COLORS.length];
                const isKeep = votes[item] === 'keep';
                const isDrop = votes[item] === 'drop';

                return (
                  <div key={item} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-2 rounded-xl shadow-sm transition-all ${colorClass}`}>
                    <span className="font-black text-lg sm:text-xl mb-4 sm:mb-0 text-slate-800 tracking-tight flex-1">
                      {item}
                    </span>
                    
                    <div className="flex w-full sm:w-auto space-x-3">
                      <button 
                        onClick={() => handleVote(item, 'keep')}
                        className={`flex-1 sm:w-32 py-4 px-2 rounded-lg font-bold text-lg transition-all transform active:scale-95 ${
                          isKeep 
                          ? 'bg-green-600 text-white shadow-inner border-transparent' 
                          : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-green-400 hover:text-green-700 hover:bg-green-50'
                        }`}
                      >
                        ✓ KEEP
                      </button>
                      <button 
                        onClick={() => handleVote(item, 'drop')}
                        className={`flex-1 sm:w-32 py-4 px-2 rounded-lg font-bold text-lg transition-all transform active:scale-95 ${
                          isDrop 
                          ? 'bg-red-600 text-white shadow-inner border-transparent' 
                          : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-red-400 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        ✕ DROP
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-10 bg-slate-800 text-white p-5 rounded-2xl shadow-md">
              <h3 className="text-xl font-bold mb-2">Request New Items</h3>
              <p className="text-sm text-slate-300 mb-4">Add items here to be voted on at the next union meeting.</p>
              
              <form onSubmit={handleAddSuggestion} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                <input 
                  type="text" 
                  value={newItemInput}
                  onChange={(e) => setNewItemInput(e.target.value)}
                  placeholder="E.g., PAPER TOWELS" 
                  className="flex-1 p-4 text-lg border-2 border-transparent rounded-xl text-slate-800 focus:ring-4 focus:ring-blue-500/50 outline-none"
                />
                <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-blue-500 transition-colors">
                  ADD ITEM
                </button>
              </form>

              {userSuggestions.length > 0 && (
                <div className="bg-slate-700/50 p-4 rounded-xl mt-4">
                  <p className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Your Requests:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {userSuggestions.map((suggestion, idx) => (
                      <li key={idx} className="font-bold text-lg">{suggestion.toUpperCase()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button 
              onClick={handleSubmitBallot}
              disabled={isSubmitting}
              className={`w-full text-white text-2xl font-black py-6 rounded-2xl transition-all shadow-xl transform active:scale-[0.98] ${
                isSubmitting 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-2xl'
              }`}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT BALLOT'}
            </button>
          </div>
        )}

        {/* --- VIEW: RESULTS DASHBOARD --- */}
        {view === 'results' && (
          <div className="p-4 sm:p-6">
            <h2 className="text-3xl font-black mb-2 text-slate-800">Session Results</h2>
            <p className="text-slate-500 mb-8 border-b-2 pb-4 font-medium">
              Ballots Submitted Here: {allSubmissions.length} <br/>
              <span className="text-sm">Master data is compiling in Google Sheets.</span>
            </p>

            <h3 className="text-xl font-bold text-slate-700 mb-4 border-l-4 border-blue-500 pl-3">Current List Votes</h3>
            <div className="space-y-3 mb-10">
              {CURRENT_ITEMS.map(item => (
                <div key={item} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-xl">
                  <span className="font-bold text-slate-800 mb-3 sm:mb-0 sm:w-1/2">{item}</span>
                  <div className="flex space-x-3 w-full sm:w-1/2 sm:justify-end">
                    <div className="flex-1 sm:flex-none text-center bg-green-100 text-green-800 font-black px-4 py-2 rounded-lg border border-green-200">
                      Keep: {voteTallies[item].keep}
                    </div>
                    <div className="flex-1 sm:flex-none text-center bg-red-100 text-red-800 font-black px-4 py-2 rounded-lg border border-red-200">
                      Drop: {voteTallies[item].drop}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-bold text-slate-700 mb-4 border-l-4 border-blue-500 pl-3">Requested Items</h3>
            {sortedSuggestions.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-100 text-center">
                <p className="text-slate-500 font-medium">No new items requested yet.</p>
              </div>
            ) : (
              <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="p-4 font-black text-slate-700 uppercase tracking-wider text-sm">Requested Item</th>
                      <th className="p-4 font-black text-slate-700 uppercase tracking-wider text-sm">Requested By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedSuggestions.map((req, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{req.item}</td>
                        <td className="p-4 font-medium text-slate-500">{req.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}