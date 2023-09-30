import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import { userContext } from "../Context";
import { useContext } from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Lesson from "./Lesson";
import TableHead from "@mui/material/TableHead";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const defaultTheme = createTheme();

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, setToken } = useContext(userContext);
  const [lessons, setLessons] = useState([{ id: 0, title: "", questions: [] }]);
  const [lessonNum, setNum] = useState(-1);
  const [stats, setStats] = useState({
    highest_score: 0,
    lowest_score: 0,
    average_score: 0,
    total_attempts: 0,
    total_score: 0,
    score_variance: null,
  });
  const [rankings, setRankings] = useState<
    { user__username: string; average_score: number }[]
  >([]);
  useEffect(() => {
    async function getLessons() {
      let realToken =
        token === undefined || token === ""
          ? localStorage.getItem("token")
          : token;
      console.log(`Token ` + token);
      try {
        const lessonsResponse = await fetch(
          "http://127.0.0.1:8000/quiz/lessons/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${realToken}`,
            },
          }
        );

        if (!lessonsResponse.ok) {
          throw new Error("Network response was not ok");
        } else {
          const responseData = await lessonsResponse.json();
          setLessons(responseData);
          console.log(responseData);
        }
        const statsResponse = await fetch(
          "http://127.0.0.1:8000/quiz/user-stats/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${realToken}`,
            },
          }
        );

        if (statsResponse.ok) {
          const responseData = await statsResponse.json();
          setStats(responseData);
          console.log(responseData);
        }
        const rankResponse = await fetch(
          "http://127.0.0.1:8000/quiz/user-rankings/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${realToken}`,
            },
          }
        );

        if (rankResponse.ok) {
          const responseData = await rankResponse.json();
          if (responseData !== undefined) {
            setRankings(responseData.user_rankings);
          }

          console.log(responseData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    getLessons();
  }, [token]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = (e: number) => {
    setNum(e);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box>
        <CssBaseline />
        <MuiAppBar position="absolute">
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>
            <Button
              onClick={() => {
                setToken("");
                localStorage.clear();
                navigate(0);
              }}
              disableElevation
              variant="contained"
              color="error"
            >
              Logout
            </Button>
          </Toolbar>
        </MuiAppBar>

        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid container spacing={3}>
                {/* Chart */}
                <Grid item xs={12} md={8} lg={9}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Data Presentation
                      </Typography>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Average Score</TableCell>
                            <TableCell>{stats.average_score}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Highest Score</TableCell>
                            <TableCell>{stats.highest_score}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Lowest Score</TableCell>
                            <TableCell>{stats.lowest_score}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Score Variance</TableCell>
                            <TableCell>
                              {stats.score_variance ?? "N/A"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Attempts</TableCell>
                            <TableCell>{stats.total_attempts}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Score</TableCell>
                            <TableCell>{stats.total_score}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Grid>
                {/* Recent Deposits */}
                <Grid item xs={12} md={4} lg={3}>
                  <Paper
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: 240,
                    }}
                  >
                    {" "}
                    <Typography
                      component="h2"
                      variant="h6"
                      color="primary"
                      gutterBottom
                    >
                      Lessons
                    </Typography>
                    {lessons.map((lesson, index) => (
                      <Button
                        value={index}
                        onClick={() => {
                          handleOpen(index);
                        }}
                      >
                        {lesson.title}
                      </Button>
                    ))}
                  </Paper>
                </Grid>
                {/* Recent Orders */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Rankings
                      </Typography>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Average Score</TableCell>
                            <TableCell>Rank</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rankings.map((user, index) => (
                            <TableRow>
                              <TableCell>{user.user__username}</TableCell>
                              <TableCell>{user.average_score}</TableCell>
                              <TableCell>{index + 1}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Container>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Lesson
                lesson={
                  lessons === undefined
                    ? { id: 0, title: "", questions: [] }
                    : lessons[lessonNum]
                }
              ></Lesson>
            </Box>
          </Modal>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
