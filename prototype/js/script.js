// 全局变量
let salesData = {
    // 示例数据
    '2023-06-01': { amount: 5280.50, remarks: '促销活动', lastModified: '2023-06-01 09:30', isAdjusted: false },
    '2023-06-02': { amount: 4350.00, remarks: '', lastModified: '2023-06-02 18:45', isAdjusted: false },
    '2023-06-05': { amount: 6100.75, remarks: '周末大促', lastModified: '2023-06-05 19:20', isAdjusted: false },
    '2023-06-08': { amount: 4800.25, remarks: '', lastModified: '2023-06-08 17:30', isAdjusted: false },
    '2023-06-10': { 
        amount: 5200.00, 
        originalAmount: 4900.00, 
        remarks: '', 
        adjustmentRemarks: '数据核对调整',
        lastModified: '2023-06-11 10:15', 
        isAdjusted: true 
    },
    '2023-06-15': { amount: 5500.00, remarks: '', lastModified: '2023-06-15 18:00', isAdjusted: false }
};

// 历史记录数据示例
let historyRecords = {
    '2023-06-10': [
        { time: '2023-06-10 18:30', action: '商户提交销售额 ¥4900.00' },
        { time: '2023-06-11 10:15', action: '运营调整销售额为 ¥5200.00，原因：数据核对调整' }
    ],
    '2023-06-15': [
        { time: '2023-06-15 18:00', action: '商户提交销售额 ¥5500.00' }
    ]
};

// 当前月份
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 判断当前页面
    const pathname = window.location.pathname;
    
    if (pathname.includes('index.html') || pathname.endsWith('/') || pathname.endsWith('/prototype/')) {
        initHomePage();
    } else if (pathname.includes('report.html')) {
        initReportPage();
    } else if (pathname.includes('calendar.html')) {
        initCalendarPage();
    }
});

// 首页初始化
function initHomePage() {
    updateHomeSummary();
    
    // 检查今日是否已填报
    const today = formatDate(new Date());
    if (!salesData[today]) {
        // 显示红点提醒
        document.getElementById('unread-badge').style.display = 'block';
    }
}

// 更新首页汇总数据
function updateHomeSummary() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // 计算当月天数
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    document.getElementById('total-days').textContent = totalDays;
    
    // 计算已填报天数和销售总额
    let reportedDays = 0;
    let totalSales = 0;
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDate(d);
        if (salesData[dateStr]) {
            reportedDays++;
            totalSales += parseFloat(salesData[dateStr].amount);
        }
    }
    
    document.getElementById('reported-days').textContent = reportedDays;
    document.getElementById('total-sales').textContent = totalSales.toFixed(2);
}

// 填报页初始化
function initReportPage() {
    // 设置默认日期为今天
    const today = new Date();
    document.getElementById('report-date').valueAsDate = today;
    
    // 检查日期有效性
    checkDateValidity();
    
    // 监听表单变化以启用/禁用提交按钮
    document.getElementById('sales-amount').addEventListener('input', validateForm);
    document.getElementById('report-date').addEventListener('change', validateForm);
}

// 检查所选日期是否有效
function checkDateValidity() {
    const dateInput = document.getElementById('report-date');
    const dateError = document.getElementById('date-error');
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    
    // 清除上一次的错误
    dateError.textContent = '';
    
    // 检查是否为过去日期
    if (selectedDate > today) {
        dateError.textContent = '不能选择未来日期';
        return false;
    }
    
    // 检查是否超出允许的补填范围（过去3个月）
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    if (selectedDate < threeMonthsAgo) {
        dateError.textContent = '只能补填过去3个月内的数据';
        return false;
    }
    
    // 检查该日期是否已经填报
    const dateStr = formatDate(selectedDate);
    if (salesData[dateStr]) {
        dateError.textContent = '该日期已填报，请修改日期或前往日历调整';
        return false;
    }
    
    return true;
}

// 验证销售额
function validateAmount() {
    const amountInput = document.getElementById('sales-amount');
    const amountError = document.getElementById('amount-error');
    const amount = parseFloat(amountInput.value);
    
    // 清除上一次的错误
    amountError.textContent = '';
    
    if (isNaN(amount) || amount <= 0) {
        amountError.textContent = '请输入正数';
        return false;
    }
    
    return true;
}

// 验证整个表单
function validateForm() {
    const isDateValid = checkDateValidity();
    const isAmountValid = validateAmount();
    const submitButton = document.getElementById('submit-button');
    
    if (isDateValid && isAmountValid && document.getElementById('sales-amount').value) {
        submitButton.classList.remove('disabled');
    } else {
        submitButton.classList.add('disabled');
    }
}

// 提交报表
function submitReport() {
    if (document.getElementById('submit-button').classList.contains('disabled')) {
        return;
    }
    
    const date = document.getElementById('report-date').value;
    const amount = parseFloat(document.getElementById('sales-amount').value);
    const remarks = document.getElementById('remarks').value;
    
    // 保存数据
    salesData[date] = {
        amount: amount,
        remarks: remarks,
        lastModified: formatDateTime(new Date()),
        isAdjusted: false
    };
    
    // 添加到历史记录
    if (!historyRecords[date]) {
        historyRecords[date] = [];
    }
    historyRecords[date].push({
        time: formatDateTime(new Date()),
        action: `商户提交销售额 ¥${amount.toFixed(2)}`
    });
    
    // 显示成功提示
    showToast('提交成功');
    
    // 延迟返回首页
    setTimeout(function() {
        goToHome();
    }, 1500);
}

// 日历页面初始化
function initCalendarPage() {
    updateCalendarTitle();
    renderCalendar();
}

// 更新日历标题
function updateCalendarTitle() {
    document.getElementById('current-month').textContent = `${currentYear}年${currentMonth + 1}月`;
}

// 渲染日历
function renderCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // 计算当月第一天是星期几（0=周日，1=周一, ...）
    const firstDayIndex = firstDay.getDay();
    
    // 添加上月的占位格子
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // 添加当月的日期
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        // 创建日期数字元素
        const dateNumber = document.createElement('div');
        dateNumber.className = 'date-number';
        dateNumber.textContent = i;
        dayElement.appendChild(dateNumber);
        
        const dateStr = formatDate(new Date(currentYear, currentMonth, i));
        
        // 创建金额/上报文本元素
        const amountElement = document.createElement('div');
        if (salesData[dateStr]) {
            amountElement.className = 'amount';
            amountElement.textContent = '¥' + salesData[dateStr].amount.toFixed(2);
        } else {
            amountElement.className = 'report-text';
            amountElement.textContent = '上报';
        }
        dayElement.appendChild(amountElement);
        
        // 标记今天
        if (currentYear === today.getFullYear() && 
            currentMonth === today.getMonth() && 
            i === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // 标记已填报日期
        if (salesData[dateStr]) {
            dayElement.classList.add('reported');
            
            // 标记已调整日期
            if (salesData[dateStr].isAdjusted) {
                dayElement.classList.add('adjusted');
            }
            
            // 添加点击事件，显示详情
            dayElement.addEventListener('click', function() {
                showDateDetail(dateStr);
            });
            
            // 添加长按事件，显示历史记录
            let pressTimer;
            dayElement.addEventListener('mousedown', function() {
                pressTimer = setTimeout(function() {
                    showHistory(dateStr);
                }, 800);
            });
            
            dayElement.addEventListener('mouseup', function() {
                clearTimeout(pressTimer);
            });
            
            dayElement.addEventListener('mouseleave', function() {
                clearTimeout(pressTimer);
            });
            
            // 移动端长按支持
            dayElement.addEventListener('touchstart', function(e) {
                pressTimer = setTimeout(function() {
                    showHistory(dateStr);
                }, 800);
                e.preventDefault();
            });
            
            dayElement.addEventListener('touchend', function() {
                clearTimeout(pressTimer);
            });
            
            dayElement.addEventListener('touchmove', function() {
                clearTimeout(pressTimer);
            });
        } else {
            // 未填报日期，点击跳转到填报页面
            dayElement.addEventListener('click', function() {
                goToReportWithDate(dateStr);
            });
        }
        
        calendarDays.appendChild(dayElement);
    }
}

// 显示日期详情
function showDateDetail(dateStr) {
    const data = salesData[dateStr];
    if (!data) return;
    
    // 更新弹窗内容
    document.getElementById('detail-date').textContent = dateStr;
    document.getElementById('original-amount').textContent = data.isAdjusted ? data.originalAmount.toFixed(2) : data.amount.toFixed(2);
    document.getElementById('detail-remarks').textContent = data.remarks || '无';
    
    // 显示调整项（如果有）
    if (data.isAdjusted) {
        document.getElementById('adjusted-item').style.display = 'block';
        document.getElementById('adjustment-remarks-item').style.display = 'block';
        document.getElementById('adjusted-amount').textContent = data.amount.toFixed(2);
        document.getElementById('adjustment-remarks').textContent = data.adjustmentRemarks || '无';
    } else {
        document.getElementById('adjusted-item').style.display = 'none';
        document.getElementById('adjustment-remarks-item').style.display = 'none';
    }
    
    // 显示弹窗
    const modal = document.getElementById('date-detail-modal');
    modal.style.display = 'flex';
}

// 关闭日期详情弹窗
function closeDateDetail() {
    document.getElementById('date-detail-modal').style.display = 'none';
}

// 显示历史记录
function showHistory(dateStr) {
    if (!historyRecords[dateStr] || historyRecords[dateStr].length === 0) return;
    
    // 更新弹窗标题
    document.getElementById('history-date').textContent = `${dateStr} 历史记录`;
    
    // 更新历史记录内容
    const recordsContainer = document.getElementById('history-records');
    recordsContainer.innerHTML = '';
    
    historyRecords[dateStr].forEach(record => {
        const recordElement = document.createElement('div');
        recordElement.className = 'history-record';
        
        const timeElement = document.createElement('div');
        timeElement.className = 'history-time';
        timeElement.textContent = record.time;
        
        const actionElement = document.createElement('div');
        actionElement.className = 'history-action';
        actionElement.textContent = record.action;
        
        recordElement.appendChild(timeElement);
        recordElement.appendChild(actionElement);
        recordsContainer.appendChild(recordElement);
    });
    
    // 显示弹窗
    const modal = document.getElementById('history-modal');
    modal.style.display = 'flex';
}

// 关闭历史记录弹窗
function closeHistory() {
    document.getElementById('history-modal').style.display = 'none';
}

// 修改日期数据
function editDate() {
    const dateStr = document.getElementById('detail-date').textContent;
    closeDateDetail();
    goToReportWithDate(dateStr);
}

// 切换到上个月
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendarTitle();
    renderCalendar();
}

// 切换到下个月
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendarTitle();
    renderCalendar();
}

// 显示帮助弹窗
function showHelp() {
    document.getElementById('help-modal').style.display = 'flex';
}

// 关闭帮助弹窗
function closeHelp() {
    document.getElementById('help-modal').style.display = 'none';
}

// 显示Toast提示
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    
    setTimeout(function() {
        toast.style.display = 'none';
    }, 2000);
}

// 页面导航函数
function goToHome() {
    window.location.href = 'index.html';
}

function goToReport() {
    window.location.href = 'report.html';
}

function goToReportWithDate(dateStr) {
    // 如果已经填报过，先将数据删除，允许重新填报
    if (salesData[dateStr]) {
        delete salesData[dateStr];
    }
    
    localStorage.setItem('preselect_date', dateStr);
    window.location.href = 'report.html';
}

function goToCalendar() {
    window.location.href = 'calendar.html';
}

// 工具函数 - 格式化日期为 YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 工具函数 - 格式化日期时间为 YYYY-MM-DD HH:MM
function formatDateTime(date) {
    const dateStr = formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
} 