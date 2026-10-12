/**
 * Pocket Calculator - Core Business Logic
 * Phát triển bởi Vibecode Senior Full-Stack Developer
 */

document.addEventListener("DOMContentLoaded", () => {
  // Trạng thái (State) ứng dụng máy tính
  let currentOperand = "0";
  let previousOperand = "";
  let operation = null;
  let isResetDisplay = false; // Thiết lập lại màn hình khi vừa bấm kết quả
  let isErrorState = false;   // Chặn tính năng khi dính lỗi (ví dụ: chia cho 0)

  // Khôi phục Lịch sử từ LocalStorage
  let calculationHistory = JSON.parse(localStorage.getItem("calc_history")) || [];

  // DOM Elements
  const displayCurrent = document.getElementById("display-current");
  const displayExpression = document.getElementById("display-expression");
  const historyListElement = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history");
  const allButtons = document.querySelectorAll("button");

  // Khởi động render lịch sử lần đầu
  renderHistory();

  // Đăng ký sự kiện Click cho mọi Button ảo
  allButtons.forEach(button => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const val = button.getAttribute("data-val");
      
      // Hiệu ứng nháy nhẹ cho phím
      flashButton(button);

      // Nếu đang trong trạng thái lỗi, chỉ cho phép bấm nút Clear "C"
      if (isErrorState && action !== "clear") return;

      switch (action) {
        case "number":
          appendNumber(val);
          break;
        case "decimal":
          appendDecimal();
          break;
        case "operator":
          selectOperator(val);
          break;
        case "clear":
          clearAll();
          break;
        case "backspace":
          performBackspace();
          break;
        case "toggle-sign":
          toggleSign();
          break;
        case "equals":
          computeResult();
          break;
      }
      updateDisplay();
    });
  });

  // Đăng ký sự kiện Phím tắt vật lý (Physical Keyboard)
  document.addEventListener("keydown", (e) => {
    // Ngăn chặn cuộn trang đối với phím Space và các nút số
    if (e.key === " ") e.preventDefault();

    if (isErrorState && e.key !== "Escape" && e.key !== "Delete") return;

    if (e.key >= "0" && e.key <= "9") {
      appendNumber(e.key);
      highlightKey(e.key);
    } else if (e.key === ".") {
      appendDecimal();
      highlightKey(".");
    } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/" || e.key === "%") {
      selectOperator(e.key);
      highlightKey(e.key);
    } else if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      computeResult();
      highlightKey("=");
    } else if (e.key === "Backspace") {
      performBackspace();
      highlightKey("⌫");
    } else if (e.key === "Escape") {
      clearAll();
      highlightKey("C");
    }
    updateDisplay();
  });

  // HÀM NGHIỆP VỤ CHÍNH

  function appendNumber(number) {
    if (currentOperand === "0" || isResetDisplay) {
      currentOperand = number;
      isResetDisplay = false;
    } else {
      // Ngăn tràn màn hình khi nhập chuỗi số quá dài
      if (currentOperand.length < 16) {
        currentOperand += number;
      }
    }
  }

  function appendDecimal() {
    if (isResetDisplay) {
      currentOperand = "0.";
      isResetDisplay = false;
      return;
    }
    // [SC-02] Ngăn chặn nhập nhiều dấu chấm thập phân
    if (!currentOperand.includes(".")) {
      currentOperand += ".";
    }
  }

  function selectOperator(op) {
    if (currentOperand === "" && previousOperand === "") return;
    
    // Nếu đã có sẵn toán hạng cũ và mới, thực hiện tính toán ngay rồi gán toán tử mới
    if (previousOperand !== "" && currentOperand !== "" && !isResetDisplay) {
      computeResult(true);
    }
    
    operation = op;
    if (currentOperand !== "") {
      previousOperand = currentOperand;
      isResetDisplay = true;
    }
  }

  function computeResult(isChained = false) {
    if (previousOperand === "" || currentOperand === "" || !operation) return;

    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    let result = 0;

    if (isNaN(prev) || isNaN(current)) return;

    // [SC-03] Xử lý an toàn các toán tử toán học & Loại bỏ floating-point precision error
    switch (operation) {
      case "+":
        result = safeAdd(prev, current);
        break;
      case "-":
        result = safeSubtract(prev, current);
        break;
      case "*":
        result = safeMultiply(prev, current);
        break;
      case "/":
        if (current === 0) {
          triggerError("Error: Division by zero");
          return;
        }
        result = safeDivide(prev, current);
        break;
      case "%":
        result = prev % current;
        break;
      default:
        return;
    }

    const formattedResult = formatOutput(result);
    const expressionString = `${previousOperand} ${formatOpSymbol(operation)} ${currentOperand}`;

    // Thêm vào lịch sử nếu không phải là tính chuỗi liên hoàn chưa kết thúc
    if (!isChained) {
      addHistoryRecord(expressionString, formattedResult);
      previousOperand = "";
      operation = null;
    } else {
      previousOperand = formattedResult;
    }

    currentOperand = formattedResult;
    isResetDisplay = true;
  }

  // Tiêu diệt lỗi làm tròn số thập phân của JavaScript (ví dụ: 0.1 + 0.2)
  function safeAdd(a, b) {
    const factor = Math.pow(10, Math.max(getDecimalLength(a), getDecimalLength(b)));
    return (Math.round(a * factor) + Math.round(b * factor)) / factor;
  }

  function safeSubtract(a, b) {
    const factor = Math.pow(10, Math.max(getDecimalLength(a), getDecimalLength(b)));
    return (Math.round(a * factor) - Math.round(b * factor)) / factor;
  }

  function safeMultiply(a, b) {
    const factor = Math.pow(10, getDecimalLength(a) + getDecimalLength(b));
    return (Math.round(a * Math.pow(10, getDecimalLength(a))) * Math.round(b * Math.pow(10, getDecimalLength(b)))) / factor;
  }

  function safeDivide(a, b) {
    const lenA = getDecimalLength(a);
    const lenB = getDecimalLength(b);
    const factor = Math.pow(10, Math.max(lenA, lenB));
    return (Math.round(a * factor)) / (Math.round(b * factor));
  }

  function getDecimalLength(num) {
    const str = num.toString();
    if (str.indexOf('.') === -1) return 0;
    return str.split('.')[1].length;
  }

  // Định dạng làm tròn thông minh tối đa 8 chữ số thập phân
  function formatOutput(num) {
    if (typeof num === "string") return num;
    if (isNaN(num)) return "0";
    
    // Giới hạn chữ số thập phân tối đa 8 chữ số để không tràn màn hình
    const str = num.toString();
    if (str.includes(".")) {
      const parts = str.split(".");
      if (parts[1].length > 8) {
        return parseFloat(num.toFixed(8)).toString();
      }
    }
    return str;
  }

  function formatOpSymbol(op) {
    switch (op) {
      case "/": return "÷";
      case "*": return "×";
      case "-": return "−";
      default: return op;
    }
  }

  function toggleSign() {
    if (currentOperand === "0" || isErrorState) return;
    if (currentOperand.startsWith("-")) {
      currentOperand = currentOperand.slice(1);
    } else {
      currentOperand = "-" + currentOperand;
    }
  }

  function performBackspace() {
    if (isResetDisplay || currentOperand === "0") return;
    if (currentOperand.length === 1 || (currentOperand.length === 2 && currentOperand.startsWith("-"))) {
      currentOperand = "0";
    } else {
      currentOperand = currentOperand.slice(0, -1);
    }
  }

  function clearAll() {
    currentOperand = "0";
    previousOperand = "";
    operation = null;
    isResetDisplay = false;
    isErrorState = false;
    enableCalculatorButtons();
  }

  function triggerError(message) {
    currentOperand = message;
    isErrorState = true;
    isResetDisplay = true;
    disableCalculatorButtons();
  }

  // Cập nhật giao diện màn hình
  function updateDisplay() {
    displayCurrent.innerText = currentOperand;
    if (operation) {
      displayExpression.innerText = `${previousOperand} ${formatOpSymbol(operation)}`;
    } else {
      displayExpression.innerText = "";
    }
  }

  // Disable phím khi lỗi
  function disableCalculatorButtons() {
    document.querySelectorAll("button").forEach(btn => {
      if (btn.id !== "btn-clear") {
        btn.disabled = true;
      }
    });
  }

  function enableCalculatorButtons() {
    document.querySelectorAll("button").forEach(btn => {
      btn.disabled = false;
    });
  }

  // QUẢN LÝ LỊCH SỬ PHÉP TÍNH (LocalStorage)

  function addHistoryRecord(expr, res) {
    const item = { expr, res, id: Date.now() };
    calculationHistory.unshift(item); // Thêm vào đầu mảng

    // Giới hạn lưu tối đa 20 bản ghi lịch sử gần nhất
    if (calculationHistory.length > 20) {
      calculationHistory.pop();
    }
    localStorage.setItem("calc_history", JSON.stringify(calculationHistory));
    renderHistory();
  }

  function renderHistory() {
    historyListElement.innerHTML = "";
    if (calculationHistory.length === 0) {
      historyListElement.innerHTML = `
        <div class="text-slate-500 text-sm text-center py-8 italic font-light">
          Chưa có lịch sử phép tính nào
        </div>
      `;
      return;
    }

    calculationHistory.forEach(item => {
      const div = document.createElement("div");
      div.className = "bg-slate-800/40 border border-slate-700/40 p-3 rounded-xl hover:bg-slate-700/30 transition duration-150 cursor-pointer text-right group";
      div.innerHTML = `
        <div class="text-xs text-slate-500 group-hover:text-slate-400 font-mono transition-colors truncate">${item.expr}</div>
        <div class="text-emerald-400 font-bold font-mono tracking-wide truncate mt-0.5" data-result-val="${item.res}">${item.res}</div>
      `;
      
      // Cho phép bấm lại vào mục lịch sử để tiếp tục tính
      div.addEventListener("click", () => {
        if (isErrorState) return;
        currentOperand = item.res;
        isResetDisplay = true;
        updateDisplay();
      });

      historyListElement.appendChild(div);
    });
  }

  clearHistoryBtn.addEventListener("click", () => {
    calculationHistory = [];
    localStorage.removeItem("calc_history");
    renderHistory();
  });

  // HIỆU ỨNG TƯƠNG TÁC PHÍM VẬT LÝ

  function flashButton(btn) {
    btn.classList.add("scale-95");
    setTimeout(() => {
      btn.classList.remove("scale-95");
    }, 100);
  }

  function highlightKey(keyChar) {
    let targetButton = null;
    allButtons.forEach(btn => {
      const val = btn.getAttribute("data-val");
      const action = btn.getAttribute("data-action");
      
      if (val === keyChar) {
        targetButton = btn;
      } else if (keyChar === "C" && action === "clear") {
        targetButton = btn;
      } else if (keyChar === "⌫" && action === "backspace") {
        targetButton = btn;
      } else if (keyChar === "=" && action === "equals") {
        targetButton = btn;
      }
    });

    if (targetButton) {
      flashButton(targetButton);
    }
  }
});
```

---