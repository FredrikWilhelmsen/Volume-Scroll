import React, { useEffect, useState } from "react";
import { Settings, Pages } from "../types";
import "../style/menuPage.css";
import Typography from "@mui/material/Typography/Typography";
import BackButton from "../components/BackButton";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";

interface UpdatePageInterface {
    settings: Settings;
    setPage: React.Dispatch<React.SetStateAction<Pages>>;
}

interface GitHubRelease {
    id: number;
    name: string;
    tag_name: string;
    body: string;
    published_at: string;
    html_url: string;
}

const UpdatePage: React.FC<UpdatePageInterface> = ({ settings, setPage }) => {
    const [releases, setReleases] = useState<GitHubRelease[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReleases = async () => {
            try {
                const response = await fetch(
                    "https://api.github.com/repos/FredrikWilhelmsen/Volume-Scroll/releases",
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch releases");
                }
                const data: GitHubRelease[] = await response.json();
                setReleases(data);
            } catch (err: any) {
                setError(
                    err.message || "An error occurred while fetching updates.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReleases();
    }, []);

    return (
        <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
            <BackButton setPage={setPage} title={"Update notes"} />

            <hr></hr>

            <Divider style={{ marginBottom: "16px" }} />

            <Box sx={{ flexGrow: 1, overflowY: "auto", paddingBottom: "16px" }}>
                {loading && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Typography
                        color="error"
                        sx={{ textAlign: "center", mt: 4 }}
                    >
                        {error}
                    </Typography>
                )}

                {!loading && !error && releases.length === 0 && (
                    <Typography sx={{ textAlign: "center", mt: 4 }}>
                        No releases found.
                    </Typography>
                )}

                {!loading &&
                    !error &&
                    releases.map((release) => (
                        <Card
                            key={release.id}
                            sx={{
                                mb: 2,
                                mx: 1,
                                backgroundColor: "#1a2333",
                                color: "white",
                                borderColor: "rgba(255, 255, 255, 0.12)",
                            }}
                            variant="outlined"
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        mb: 1,
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        sx={{ color: "white" }}
                                    >
                                        {release.name || release.tag_name}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: "pre-wrap",
                                        color: "white",
                                        mb: 1,
                                    }}
                                >
                                    {release.body}
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "rgba(255, 255, 255, 0.7)",
                                        }}
                                    >
                                        {new Date(
                                            release.published_at,
                                        ).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
            </Box>
        </div>
    );
};

export default UpdatePage;
