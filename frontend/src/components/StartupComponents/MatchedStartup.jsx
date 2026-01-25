import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

export default function MatchedStartup() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [requestStatus, setRequestStatus] = useState(false); // Removed global status

    const handleSendRequest = async (startupId) => {
        try {
            await api.post("/request/send-investor-request", { startupId });

            // Optimistically update the UI for THAT specific startup
            setMatches(prevMatches =>
                prevMatches.map(startup =>
                    startup._id === startupId
                        ? { ...startup, requestStatus: 'pending' }
                        : startup
                )
            );

            toast.success("Request sent successfully");
        } catch (err) {
            toast.error("message:", err.response?.data?.message || "Failed to send request");
            console.log("messaage:", err.response?.data?.message)
        }
    };

    const fetchMatches = async () => {
        try {
            const res = await api.get("/investor/match-startups");
            // Backend now returns matches with `requestSent` property
            setMatches(Array.isArray(res.data.matches) ? res.data.matches : []);

        } catch (err) {
            console.log("Error fetching matches", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    if (loading)
        return (
            <div className="text-white text-center mt-10 text-xl">Loading matches...</div>
        );

    return (
        <>
            {/* <Navbar /> */}
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl">

                    <h1 className="text-3xl font-bold mb-6 text-center">
                        Matched Startups
                    </h1>

                    {matches.length === 0 && (
                        <p className="text-center text-gray-400 mt-10 text-lg">
                            No matching investors found.
                        </p>
                    )}

                    <div className="space-y-6">
                        {matches.map((startup, index) => (
                            <div
                                key={index}
                                className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600"
                            >
                                <h2 className="text-xl font-bold mb-3">{startup.startupName}</h2>
                                <p><strong>Match:</strong> {(startup.similarity * 100).toFixed(0)}%</p>
                                <p><strong>Location:</strong> {startup.location}</p>
                                <p>
                                    <strong>Investment Range:</strong> ₹{startup.fundingNeeded}             </p>


                                <p>
                                    <strong>Preferred Industries:</strong>{" "}
                                    {startup.industry}
                                </p>
                                <button
                                    onClick={() => navigate(`/startup/profile/${startup.userId}`, { state: { from: "matched" } })}
                                    className="mt-8 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white font-semibold"
                                >
                                    View Full Profile
                                </button>


                                {/* Action Button Logic */}
                                {startup.requestStatus === "accepted" ? (
                                    <button
                                        onClick={() =>
                                            navigate(`/chats`, {
                                                state: {
                                                    selectedChat: {
                                                        requestId: startup.requestId,
                                                        name: startup.startupName,
                                                    },
                                                },
                                            })
                                        }
                                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-semibold"
                                    >
                                        Message
                                    </button>
                                ) : (
                                    <button
                                        disabled={!!startup.requestStatus}
                                        onClick={() => handleSendRequest(startup._id)}
                                        className={`mt-4 w-full py-2 rounded-lg text-white font-semibold 
                                            ${startup.requestStatus
                                                ? "bg-gray-500 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"}
                                        `}
                                    >
                                        {startup.requestStatus === "pending" ? "Request Sent" :
                                            startup.requestStatus === "rejected" ? "Rejected" : "Send Request"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => navigate("/investor/dashboard")}
                            className="bg-red-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
