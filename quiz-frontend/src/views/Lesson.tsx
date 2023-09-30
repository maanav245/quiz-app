import * as React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import MobileStepper from "@mui/material/MobileStepper";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { userContext } from "../Context";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";

type Lesson = {
  id: number;
  title: string;
  questions: {
    id: number;
    text: string;
    lesson: number;
    is_multiple: boolean;
    choices: {
      id: number;
      text: string;
      is_correct: string;
      question: number;
    }[];
  }[];
};

export default function Lesson({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate();
  const { token, setToken } = useContext(userContext);
  const [activeStep, setActiveStep] = React.useState(0);
  const [answerMap, setAnswerMap] = React.useState(fillMap());
  const [showSubmit, setShowSubmit] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(-1);
  const maxSteps = lesson.questions.length;

  function fillMap(): Map<number, number[]> {
    const tempMap = new Map<number, number[]>();
    lesson.questions.forEach((element: { id: number }) => {
      tempMap.set(element.id, []);
    });
    console.log(tempMap);
    return tempMap;
  }

  React.useEffect(() => {
    setSubmitted(-1);
  }, []);

  function setMap(question: number, choice: number) {
    console.log(answerMap);
    setAnswerMap((prevMap) => {
      const tempMap = new Map(prevMap);
      if (!tempMap.has(question)) {
        tempMap.set(question, [choice]);
      } else {
        const arr = tempMap.get(question) || [];
        arr.push(choice);
        tempMap.set(question, arr);
      }

      let returnVal = true;
      if (tempMap.size < lesson.questions.length) {
        returnVal = false;
      } else {
        tempMap.forEach((value, key) => {
          if (value.length === 0) {
            returnVal = false;
          }
        });
      }
      setShowSubmit(returnVal);

      return tempMap;
    });
  }

  const submitData = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      let realToken =
        token === undefined || token === ""
          ? localStorage.getItem("token")
          : token;
      let reqObj = {
        lesson_id: lesson.id,
        answers: Object.fromEntries(answerMap),
      };
      console.log(reqObj);
      const response = await fetch(
        "http://127.0.0.1:8000/quiz/submit-lesson/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${realToken}`,
          },
          body: JSON.stringify(reqObj),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      } else {
        const responseData = await response.json();
        console.log(responseData);
        setSubmitted(responseData.score);
        setShowSubmit(false);
        // navigate(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box
      onSubmit={submitData}
      component="form"
      sx={{ maxWidth: 400, flexGrow: 1 }}
    >
      {!showSubmit && submitted === -1 && (
        <Alert severity="info">Please select an answer for all questions</Alert>
      )}
      {maxSteps > 0 && (
        <div>
          <Paper
            square
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              height: 50,
              pl: 2,
              bgcolor: "background.default",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                marginTop: 5,
              }}
            >
              {submitted === -1 ? lesson.questions[activeStep].text : "Results"}
            </Typography>
          </Paper>
          <Box
            sx={{
              height: 255,
              maxWidth: 400,
              width: "100%",
              p: 2,
              marginTop: 3,
            }}
          >
            {submitted === -1 ? (
              <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">
                  Please select:{" "}
                </FormLabel>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  name="radio-buttons-group"
                >
                  {lesson.questions[activeStep].choices.map((choice) =>
                    lesson.questions[activeStep].is_multiple ? (
                      <FormControlLabel
                        key={choice.id}
                        value={choice.id}
                        control={
                          <Checkbox
                            key={choice.id}
                            value={choice.id}
                            checked={answerMap
                              .get(lesson.questions[activeStep].id)
                              ?.includes(choice.id)}
                            onChange={(e) => {
                              setMap(
                                lesson.questions[activeStep].id,
                                Number(e.target.value)
                              );
                            }}
                          />
                        }
                        label={choice.text}
                      />
                    ) : (
                      <FormControlLabel
                        key={choice.id}
                        value={choice.id}
                        control={
                          <Checkbox
                            key={choice.id}
                            value={choice.id}
                            checked={answerMap
                              .get(lesson.questions[activeStep].id)
                              ?.includes(choice.id)}
                            onChange={(e) => {
                              setMap(
                                lesson.questions[activeStep].id,
                                Number(e.target.value)
                              );
                            }}
                          />
                        }
                        label={choice.text}
                      />
                    )
                  )}
                </RadioGroup>
              </FormControl>
            ) : (
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress variant="determinate" value={submitted} />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                  >{`${Math.round(submitted)}%`}</Typography>
                </Box>
              </Box>
            )}
          </Box>
          {submitted === -1 ? (
            <MobileStepper
              variant="text"
              steps={maxSteps}
              position="static"
              activeStep={activeStep}
              nextButton={
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={activeStep === maxSteps - 1}
                >
                  Next
                </Button>
              }
              backButton={
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
              }
            />
          ) : (
            ""
          )}
        </div>
      )}
      {showSubmit && (
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit
        </Button>
      )}

      <Button
        onClick={() => {
          navigate(0);
        }}
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Exit
      </Button>
    </Box>
  );
}
