import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { userContext } from "../Context";
import { useContext } from "react";
import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

type LoginObject = {
  username: string;
  password: string;
};

const defaultTheme = createTheme();

export default function SignIn() {
  const navigate = useNavigate();
  const [loginForm, setForm] = useState<LoginObject>({
    username: "",
    password: "",
  });

  const { token, setToken } = useContext(userContext);
  useEffect(() => {
    localStorage.clear();
    setToken("");
  }, [setToken]);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(loginForm);
    try {
      const response = await fetch("http://127.0.0.1:8000/quiz/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      } else {
        const responseData = await response.json();
        localStorage.setItem("token", responseData.token);
        setToken(responseData.token);
        console.log(responseData);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              onChange={(e) => {
                e.preventDefault();
                setForm({ ...loginForm, username: e.target.value });
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => {
                e.preventDefault();
                setForm({ ...loginForm, password: e.target.value });
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item>
                <Link to="/register">{"Don't have an account? Sign Up"}</Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
