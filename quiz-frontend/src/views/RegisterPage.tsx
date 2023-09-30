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
import { useContext, useEffect } from "react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

type RegisterObject = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

const defaultTheme = createTheme();

export default function SignUp() {
  const navigate = useNavigate();
  const [registerForm, setForm] = useState<RegisterObject>({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const { token, setToken } = useContext(userContext);
  useEffect(() => {
    localStorage.clear();
    setToken("");
  }, [setToken]);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    localStorage.clear();
    event.preventDefault();
    console.log(registerForm);
    try {
      const response = await fetch("http://127.0.0.1:8000/quiz/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
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
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  onChange={(e) => {
                    e.preventDefault();
                    setForm({ ...registerForm, first_name: e.target.value });
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  onChange={(e) => {
                    e.preventDefault();
                    setForm({ ...registerForm, last_name: e.target.value });
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  onChange={(e) => {
                    e.preventDefault();
                    setForm({ ...registerForm, username: e.target.value });
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  onChange={(e) => {
                    e.preventDefault();
                    setForm({ ...registerForm, email: e.target.value });
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={(e) => {
                    e.preventDefault();
                    setForm({ ...registerForm, password: e.target.value });
                  }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login">Already have an account? Sign in</Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
