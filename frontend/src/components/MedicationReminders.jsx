import { useState, useEffect } from "react";
import { Pill, Plus, Clock, Check, X, Bell } from "lucide-react";

const MedicationReminders = () => {
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", times: [], notes: "" });

  useEffect(() => {
    const saved = localStorage.getItem("medications");
    if (saved) setMedications(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("medications", JSON.stringify(medications));
  }, [medications]);

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage || newMed.times.length === 0) return;
    
    const medication = {
      id: Date.now(),
      ...newMed,
      taken: {},
      streak: 0
    };
    
    setMedications([...medications, medication]);
    setNewMed({ name: "", dosage: "", times: [], notes: "" });
    setShowAddForm(false);
  };

  const markTaken = (medId, time) => {
    const today = new Date().toDateString();
    setMedications(meds => 
      meds.map(med => {
        if (med.id === medId) {
          const taken = { ...med.taken };
          if (!taken[today]) taken[today] = [];
          taken[today].push(time);
          return { ...med, taken, streak: med.streak + 1 };
        }
        return med;
      })
    );
  };

  const addTime = (time) => {
    if (time && !newMed.times.includes(time)) {
      setNewMed({ ...newMed, times: [...newMed.times, time] });
    }
  };

  const getTodayStatus = (med) => {
    const today = new Date().toDateString();
    const takenToday = med.taken[today] || [];
    return {
      taken: takenToday.length,
      total: med.times.length,
      complete: takenToday.length >= med.times.length
    };
  };

  return (
    <div className="p-4 bg-base-100 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          Medication Reminders
        </h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn btn-sm btn-primary"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {medications.map(med => {
        const status = getTodayStatus(med);
        return (
          <div key={med.id} className="card bg-base-200 p-3 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{med.name}</h4>
                <p className="text-sm opacity-70">{med.dosage}</p>
              </div>
              <div className="text-right">
                <div className={`badge ${status.complete ? 'badge-success' : 'badge-warning'}`}>
                  {status.taken}/{status.total}
                </div>
                <p className="text-xs mt-1">Streak: {med.streak}</p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {med.times.map(time => {
                const today = new Date().toDateString();
                const taken = med.taken[today]?.includes(time);
                return (
                  <button
                    key={time}
                    onClick={() => !taken && markTaken(med.id, time)}
                    className={`btn btn-xs ${taken ? 'btn-success' : 'btn-outline'}`}
                    disabled={taken}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {time}
                    {taken && <Check className="w-3 h-3 ml-1" />}
                  </button>
                );
              })}
            </div>
            
            {med.notes && (
              <p className="text-xs mt-2 opacity-70">{med.notes}</p>
            )}
          </div>
        );
      })}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-96 max-w-[90vw]">
            <h4 className="font-semibold mb-4">Add Medication</h4>
            
            <input
              type="text"
              placeholder="Medication name"
              className="input input-bordered w-full mb-3"
              value={newMed.name}
              onChange={(e) => setNewMed({...newMed, name: e.target.value})}
            />
            
            <input
              type="text"
              placeholder="Dosage (e.g., 10mg)"
              className="input input-bordered w-full mb-3"
              value={newMed.dosage}
              onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
            />
            
            <div className="mb-3">
              <input
                type="time"
                className="input input-bordered w-full mb-2"
                onChange={(e) => addTime(e.target.value)}
              />
              <div className="flex gap-1 flex-wrap">
                {newMed.times.map(time => (
                  <span key={time} className="badge badge-primary">
                    {time}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => setNewMed({...newMed, times: newMed.times.filter(t => t !== time)})}
                    />
                  </span>
                ))}
              </div>
            </div>
            
            <textarea
              placeholder="Notes (optional)"
              className="textarea textarea-bordered w-full mb-4"
              value={newMed.notes}
              onChange={(e) => setNewMed({...newMed, notes: e.target.value})}
            />
            
            <div className="flex gap-2">
              <button onClick={addMedication} className="btn btn-primary flex-1">
                Add
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationReminders;