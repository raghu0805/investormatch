import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function MatchedStudent() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleSendRequest = async (studentId) => {
        try {
            await api.post("/request/send-investor-request", { studentId, startupId: studentId });

            setMatches(prevMatches =>
                prevMatches.map(student =>
                    student._id === studentId
                        ? { ...student, requestStatus: 'pending' }
                        : student
                )
            );

            toast.success("Request sent successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send request");
        }
    };

    const fetchMatches = async () => {
        try {
            const res = await api.get("/investor/match-students").catch(() => api.get("/investor/match-startups"));
            setMatches(Array.isArray(res.data.matches) ? res.data.matches : []);
        } catch (err) {
            console.error("Error fetching matches", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    if (loading)
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center text-xl">
                Loading matched students...
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Matched Students / Projects
                </h1>

                {matches.length === 0 && (
                    <p className="text-center text-gray-400 mt-10 text-lg">
                        No matching student profiles found.
                    </p>
                )}
                <div className="space-y-6">
                    {matches.map((student, index) => {
                        const name = student.studentName || student.startupName || "Student Project";
                        return (
                            <div
                                key={index}
                                className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600"
                            >
                                <h2 className="text-xl font-bold mb-3">{name}</h2>
                                <p><strong>Founder / Student:</strong> {student.founderName}</p>
                                <p><strong>Match Score:</strong> {(student.similarity * 100).toFixed(0)}%</p>
                                <p><strong>Location:</strong> {student.location}</p>
                                <p><strong>Funding Needed:</strong> ₹{student.fundingNeeded}</p>
                                <p><strong>Industry / Domain:</strong> {student.industry}</p>

                                <button
                                    onClick={() => navigate(`/student/profile/${student.userId}`, { state: { from: "matched" } })}
                                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white font-semibold cursor-pointer"
                                >
                                    View Full Profile
                                </button>

                                <button
                                    disabled={!!student.requestStatus}
                                    onClick={() => handleSendRequest(student._id)}
                                    className={`mt-4 w-full py-2 rounded-lg text-white font-semibold cursor-pointer
                                        ${student.requestStatus
                                            ? "bg-gray-500 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"}
                                    `}
                                >
                                    {student.requestStatus === "pending" ? "Request Sent" :
                                        student.requestStatus === "accepted" ? "Accepted" :
                                        student.requestStatus === "rejected" ? "Rejected" : "Send Request"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => navigate("/investor/dashboard")}
                        className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
