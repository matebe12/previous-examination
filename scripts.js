let fileName = "";

function showTab(tabId) {
  // 모든 탭 버튼에서 active 클래스 제거
  document.querySelectorAll(".tabs button").forEach((button) => {
    button.classList.remove("active");
  });

  // 모든 탭 콘텐츠에서 active 클래스 제거
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // 선택된 탭 콘텐츠에 active 클래스 추가
  document.getElementById(tabId).classList.add("active");

  // 클릭한 버튼에 active 클래스 추가
  const clickedButton = document.querySelector(`.tabs button[onclick="showTab('${tabId}')"]`);
  clickedButton.classList.add("active");

  // 탭 슬라이더 위치 조정
  const tabSlider = document.getElementById("tabSlider");
  const tabIndex = Array.from(clickedButton.parentNode.children).indexOf(clickedButton);
  tabSlider.style.left = `${tabIndex * 50}%`;
}

function clearInputs() {
  document.getElementById("questionCount").value = "";
  document.getElementById("startNumber").value = "";
  document.getElementById("questionsContainer").innerHTML = "";
  document.getElementById("answersContainer").innerHTML = "";
  document.getElementById("scoreDisplay").textContent = "";
  document.getElementById("recentScoreDisplay").textContent = "최근 점수: -";
  document.getElementById("recentScoreDisplay").style.color = "";
}

function setRecentScoreDisplay(score) {
  const recentScoreDisplay = document.getElementById("recentScoreDisplay");
  recentScoreDisplay.textContent = `최근 점수: ${score}%`;

  // 기존 클래스 제거
  recentScoreDisplay.classList.remove("high-score", "good-score", "average-score", "low-score", "very-low-score");

  // 점수에 따른 색상 클래스 추가
  if (score >= 90) {
    recentScoreDisplay.classList.add("high-score");
  } else if (score >= 80) {
    recentScoreDisplay.classList.add("good-score");
  } else if (score >= 70) {
    recentScoreDisplay.classList.add("average-score");
  } else if (score >= 60) {
    recentScoreDisplay.classList.add("low-score");
  } else {
    recentScoreDisplay.classList.add("very-low-score");
  }
}

function generateQuestions() {
  const questionCount = parseInt(document.getElementById("questionCount").value);
  const startNumber = parseInt(document.getElementById("startNumber").value);
  const questionsContainer = document.getElementById("questionsContainer");
  const answersContainer = document.getElementById("answersContainer");

  // 기존 필드 초기화
  questionsContainer.innerHTML = "";
  answersContainer.innerHTML = "";

  if (isNaN(questionCount) || isNaN(startNumber)) {
    alert("문제 수와 시작 번호를 입력해주세요.");
    return;
  }

  if (!fileName) {
    alert("PDF 파일을 먼저 선택해주세요.");
    return;
  }

  // 로컬 스토리지에서 정답 데이터 로드
  const correctData = JSON.parse(localStorage.getItem(`${fileName}_정답`) || "{}");

  for (let i = 0; i < questionCount; i++) {
    const questionNumber = startNumber + i;

    // 정답 입력 필드 생성
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("question");
    answerDiv.innerHTML = `
            <label>정답 ${questionNumber}: 
                <input type="text" id="answer${questionNumber}" maxlength="1" oninput="validateAnswer(this)"
                       value="${correctData[questionNumber] || ""}">
            </label>
        `;
    answersContainer.appendChild(answerDiv);

    // 답안 입력 필드 생성
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.innerHTML = `
            <label>문제 ${questionNumber}: 
                <input type="text" data-answer-id="answer${questionNumber}" maxlength="1" oninput="validateAndMoveToNext(this)">
            </label>
        `;
    questionsContainer.appendChild(questionDiv);
  }

  // 문제 수와 시작 번호를 로컬 스토리지에 저장
  saveSettingsToLocalStorage();
}

function validateAndMoveToNext(input) {
  const value = input.value;
  // 1에서 5 사이 숫자만 입력 가능
  if (!/^[1-5]$/.test(value)) {
    input.value = ""; // 유효하지 않으면 지움
    return;
  }

  // 다음 입력 필드로 포커스 이동
  const nextInput = input.closest(".question").nextElementSibling?.querySelector("input");
  if (nextInput) {
    nextInput.focus();
  }
}

function validateAnswer(input) {
  const value = input.value;
  // 1에서 5 사이 숫자만 입력 가능
  if (!/^[1-5]$/.test(value)) {
    input.value = ""; // 유효하지 않으면 지움
    return;
  }

  // 입력된 정답 값을 로컬 스토리지에 저장
  saveCorrectAnswersToLocalStorage();

  // 다음 입력 필드로 포커스 이동
  const nextInput = input.closest(".question").nextElementSibling?.querySelector("input");
  if (nextInput) {
    nextInput.focus();
  }
}

function saveCorrectAnswersToLocalStorage() {
  if (!fileName) {
    console.log("파일이 선택되지 않았습니다.");
    return;
  }

  const corrects = document.querySelectorAll('input[id^="answer"]');
  const correctData = {};

  corrects.forEach((correctInput) => {
    const questionNumber = correctInput.id.replace("answer", "");
    correctData[questionNumber] = correctInput.value;
  });

  try {
    localStorage.setItem(`${fileName}_정답`, JSON.stringify(correctData));
    console.log("정답이 저장되었습니다:", correctData);
  } catch (error) {
    console.error("정답 저장 중 오류 발생:", error);
  }
}

function saveSettingsToLocalStorage() {
  if (!fileName) {
    console.log("파일이 선택되지 않았습니다.");
    return;
  }

  const questionCount = document.getElementById("questionCount").value;
  const startNumber = document.getElementById("startNumber").value;

  try {
    localStorage.setItem(`${fileName}_설정`, JSON.stringify({ questionCount, startNumber }));
    console.log("설정이 저장되었습니다:", { questionCount, startNumber });
  } catch (error) {
    console.error("설정 저장 중 오류 발생:", error);
  }
}

function loadSettingsFromLocalStorage(fileName) {
  const settingsData = JSON.parse(localStorage.getItem(`${fileName}_설정`) || "{}");
  if (settingsData.questionCount) {
    document.getElementById("questionCount").value = settingsData.questionCount;
  }
  if (settingsData.startNumber) {
    document.getElementById("startNumber").value = settingsData.startNumber;
  }

  // 문제 수와 시작 번호가 있으면 바로 문제 생성
  if (settingsData.questionCount && settingsData.startNumber) {
    generateQuestions();
  }

  // 최근 점수 로드
  const recentScore = localStorage.getItem(`${fileName}_최근점수`);
  if (recentScore) {
    setRecentScoreDisplay(recentScore);
  }
}

function calculateScore() {
  const questions = document.querySelectorAll("input[data-answer-id]");

  // 빈 답안 필드가 있으면 포커스 이동 후 점수 계산 중단
  for (const questionInput of questions) {
    if (questionInput.value.trim() === "") {
      alert("모든 답안을 입력해주세요.");
      questionInput.focus();
      return;
    }
  }

  let correctAnswers = 0;

  questions.forEach((questionInput) => {
    const userAnswer = questionInput.value.trim();
    const answerId = questionInput.getAttribute("data-answer-id");
    const correctAnswer = document.getElementById(answerId).value.trim();

    // 초기화
    questionInput.style.color = "";
    questionInput.nextElementSibling?.remove();

    // 정답 비교 및 스타일 적용
    if (userAnswer === correctAnswer) {
      questionInput.style.color = "green";
    } else {
      questionInput.style.color = "red";
      const errorMsg = document.createElement("span");
      errorMsg.style.color = "red";
      errorMsg.style.marginLeft = "10px";
      errorMsg.textContent = `(내 답: ${userAnswer || "없음"}, 정답: ${correctAnswer})`;
      questionInput.parentNode.appendChild(errorMsg);
    }

    if (userAnswer === correctAnswer) {
      correctAnswers++;
    }
  });

  const score = (correctAnswers / questions.length) * 100;
  document.getElementById("scoreDisplay").textContent = `점수: ${score.toFixed(2)}점`;

  // 최근 점수 로컬 스토리지에 저장
  if (fileName) {
    localStorage.setItem(`${fileName}_최근점수`, score.toFixed(2));
    setRecentScoreDisplay(score.toFixed(2));
  }
}

// PDF 미리보기 및 데이터 로딩
document.getElementById("pdfInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    const fileURL = URL.createObjectURL(file);
    const pdfPreview = document.getElementById("pdfPreview");
    pdfPreview.innerHTML = `<iframe src="${fileURL}" width="100%" height="100%"></iframe>`;

    // 기존 입력 필드 초기화
    clearInputs();

    // 문제 수와 시작 번호 로드
    loadSettingsFromLocalStorage(file.name);

    // 정답 데이터가 존재할 경우 불러오기
    if (localStorage.getItem(`${file.name}_정답`)) {
      generateQuestions(); // 파일명 기반으로 정답 데이터 불러오기
    }
  } else {
    alert("PDF 파일을 선택해주세요.");
  }
});

// 드래그 앤 드롭 영역 이벤트 처리
const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("active");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("active");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("active");

  const files = event.dataTransfer.files;
  if (files.length > 0 && files[0].type === "application/pdf") {
    handleFileSelect(files);
  } else {
    alert("PDF 파일만 선택 가능합니다.");
  }
});

// 파일 선택 핸들러
function handleFileSelect(files) {
  const file = files[0];
  if (file && file.type === "application/pdf") {
    const fileURL = URL.createObjectURL(file);
    const pdfPreview = document.getElementById("pdfPreview");
    pdfPreview.innerHTML = `<iframe src="${fileURL}" width="100%" height="100%"></iframe>`;
    fileName = file.name;
    clearInputs();
    loadSettingsFromLocalStorage(file.name);

    if (localStorage.getItem(`${file.name}_정답`)) {
      generateQuestions();
    }
  } else {
    alert("PDF 파일을 선택해주세요.");
  }
}

// 기존 pdfInput에서 직접 파일 선택 시에도 handleFileSelect 호출
document.getElementById("pdfInput").addEventListener("change", function () {
  handleFileSelect(this.files);
});

// 기본적으로 정답 입력 탭을 보여줌
showTab("solveTab");
