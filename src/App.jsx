import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#4b6ef5");
  const [noteInput, setNoteInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load from storage
  useEffect(() => {
    const stored = localStorage.getItem("pocketNotes");
    if (stored) {
      setGroups(JSON.parse(stored));
    }
  }, []);

  // Save to storage
  useEffect(() => {
    localStorage.setItem("pocketNotes", JSON.stringify(groups));
  }, [groups]);

  const getInitials = (name) => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim().length < 2) {
      alert("Group name must be at least 2 characters");
      return;
    }

    const duplicate = groups.some(
      g => g.name.toLowerCase() === newGroupName.trim().toLowerCase()
    );

    if (duplicate) {
      alert("Group already exists");
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: newGroupName.trim(),
      color: selectedColor,
      notes: []
    };

    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setShowModal(false);
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);

  const handleAddNote = () => {
    if (!noteInput.trim()) return;

    const updatedGroups = groups.map(group => {
      if (group.id === activeGroupId) {
        return {
          ...group,
          notes: [
            ...group.notes,
            {
              id: Date.now(),
              text: noteInput.trim(),
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    setNoteInput("");
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })} • ${d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  };

  return (
    <div className={`appContainer ${isMobile ? "mobile" : ""}`}>

      {/* SIDEBAR */}
      {(!isMobile || !activeGroupId) && (
        <div className="sidebar">
          <h2 className="logo">Pocket Notes</h2>

          <div className="groupList">
            {groups.map(group => (
              <div
                key={group.id}
                className={`groupItem ${activeGroupId === group.id ? "active" : ""}`}
                onClick={() => setActiveGroupId(group.id)}
              >
                <div className="circle" style={{ background: group.color }}>
                  {getInitials(group.name)}
                </div>
                <p>{group.name}</p>
              </div>
            ))}
          </div>

          <button className="addBtn" onClick={() => setShowModal(true)}>+</button>
        </div>
      )}

      {/* NOTES AREA */}
      {(!isMobile || activeGroupId) && (
        <div className="notesArea">
          {!activeGroup ? (
            <div className="emptyState">
              <h1>Pocket Notes</h1>
              <p>Select a group to start writing notes.</p>
            </div>
          ) : (
            <>
              <div className="notesHeader" style={{ background: activeGroup.color }}>
                {isMobile && (
                  <button
                    className="backBtn"
                    onClick={() => setActiveGroupId(null)}
                  >
                    ←
                  </button>
                )}
                <div className="circle small">
                  {getInitials(activeGroup.name)}
                </div>
                <h3>{activeGroup.name}</h3>
              </div>

              <div className="notesList">
                {activeGroup.notes.map(note => (
                  <div key={note.id} className="noteCard">
                    <p>{note.text}</p>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                ))}
              </div>

              <div className="inputArea">
                <textarea
                  placeholder="Enter your text here..........."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <button
                  disabled={!noteInput.trim()}
                  className={noteInput.trim() ? "sendActive" : "sendDisabled"}
                  onClick={handleAddNote}
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modalOverlay" onClick={() => setShowModal(false)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Group</h3>

            <input
              placeholder="Enter group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />

            <div className="colorOptions">
              {["#4b6ef5","#B38BFA","#FF79F2","#FFB347","#50C878","#6A5ACD"].map(color => (
                <div
                  key={color}
                  className="colorCircle"
                  style={{ background: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>

            <button onClick={handleCreateGroup}>Create</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;