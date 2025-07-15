import MemoLedger from "./MemoLedger";
import "./App.css";
import "./MemoLedger.css";
import MemoLedgerContext from "./MemoLedgerContext"

function App() {
    return (
        <div className="App">
            <MemoLedgerContext.Provider value={{}}>
                <MemoLedger />
            </MemoLedgerContext.Provider>
        </div>
    );
}

export default App;
