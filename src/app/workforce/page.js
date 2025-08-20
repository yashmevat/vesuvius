"use client";
import { useEffect, useState } from "react";

export default function WorkforceDashboard() {
  const [reports, setReports] = useState([]);
  const [shortText, setShortText] = useState("");
  const [beforeImg, setBeforeImg] = useState(null);
  const [afterImg, setAfterImg] = useState(null);  
  const [modalType, setModalType] = useState(null); // clients, workforce, update, delete
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    fetch("/api/workforce/daily-reports").then(res => res.json()).then(setReports);
  }, []);

  const submitReport = async () => {
    const formData = new FormData();
    formData.append("short_text", shortText);
    formData.append("before_image", beforeImg);
    formData.append("after_image", afterImg);

    await fetch("/api/workforce/daily-reports", {
      method: "POST",
      body: formData
    });

    setShortText("");
    setBeforeImg(null);
    setAfterImg(null);
    location.reload();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Workforce Dashboard</h1>

      <section>
        <h2>Submit Daily Report</h2>
        <input placeholder="Short Text" value={shortText} onChange={e => setShortText(e.target.value)} />
        <input type="file" onChange={e => setBeforeImg(e.target.files[0])} />
        <input type="file" onChange={e => setAfterImg(e.target.files[0])} />
        <button onClick={submitReport}>Submit</button>
      </section>

      <section>
        <h2>My Reports</h2>
        {reports.map(r => (
          <div key={r.id}>
            {r.short_text} - {r.status}
          </div>
        ))}
      </section>
    </div>
  );
}
