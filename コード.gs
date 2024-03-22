let notStartedYet = "未着手";
let workInProgress = "進行中";
let completed = "完了";
let scheduleImageFileID = '1Mqwjxosxb5N1bxfzpph3gITe3OuXYdGp';
let scheduleImageUrl = 'https://drive.google.com/uc?id=' + scheduleImageFileID;
let progressImageFileID = '1IoRE5gz4oz8hRH9-lPgRazyAMOUri-ut';
let progerssImageUrl = 'https://drive.google.com/uc?id=' + progressImageFileID;
let gantchartPixel = 20.78;

let sheetID = '1kGihsMZ7RjzDtbCRPy-Trk7tKe3RL9m1tjHd9Wmppcg';


function doGet(e) {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  let page = (e.parameter.p || "index");
  let template = HtmlService.createTemplateFromFile(page);

  if (page == "project")
  {
    let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
    template.data = projectSheet.getDataRange().getValues();
  }
  else if(page == "task")
  {
    let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
    template.projectData = projectSheet.getDataRange().getValues();
    
    let taskSheet = spreadsheet.getSheetByName("タスク一覧");
    template.taskData = taskSheet.getDataRange().getValues();
  }
  else if (page == "progress")
  {
    let taskSheet = spreadsheet.getSheetByName("タスク一覧");
    template.taskData = taskSheet.getDataRange().getValues();

    let progressSheet = spreadsheet.getSheetByName("進捗状況");
    template.progressData = progressSheet.getDataRange().getValues();
  }
  else if (page == "gantchart")
  {
    let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
    template.projectData = projectSheet.getDataRange().getValues();
  }
  else if (page == "setting")
  {
    let holidaySheet = spreadsheet.getSheetByName("定休日");
    template.holidayData = holidaySheet.getDataRange().getValues();
  }  

  return template.evaluate();
}

function getTaskData()
{
  let spreadsheet = SpreadsheetApp.openById(sheetID);
  let taskData = spreadsheet.getSheetByName("タスク一覧").getDataRange().getValues();
  
  for (let i = 1; i < taskData.length; ++i)
  {
    taskData[i][4] = taskData[i][4].toDateString();
    taskData[i][5] = taskData[i][5].toDateString();
  }

  return taskData;
}

function getProjectData()
{
  let spreadsheet = SpreadsheetApp.openById(sheetID);
  let projectData = spreadsheet.getSheetByName("プロジェクト一覧").getDataRange().getValues();
  
  for (let i = 1; i < projectData.length; ++i)
  {
    projectData[i][2] = projectData[i][2].toDateString();
    projectData[i][3] = projectData[i][3].toDateString();
  }

  return projectData;
}

function getHolidayData()
{
  let spreadsheet = SpreadsheetApp.openById(sheetID);
  let holidayData = spreadsheet.getSheetByName("定休日").getDataRange().getValues();
  
  return holidayData;
}

function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

function getSavedData() {
  let spreadsheet = SpreadsheetApp.openById(sheetID);

  let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
  let projectData = projectSheet.getDataRange().getValues();

  let data = new Array();

  for (let i = 1; i < projectData.length; ++i)
  {
    let projectID = projectData[i][0];
    let projectName = projectData[i][1];
    let sheetname = projectID + "_" + projectName + "_ガントチャート";
    let gantchartSheet = spreadsheet.getSheetByName(sheetname);
    let gantchartData = gantchartSheet.getDataRange().getValues();

    for (let j = 1; j < gantchartData.length; ++j)
    {
      gantchartData[j][3] = gantchartData[j][3].toDateString();
      gantchartData[j][4] = gantchartData[j][4].toDateString();
    }

    data.push(gantchartData);
  }

  console.log(data);

  return data;
}

function getProjectRow(id)
{
  let spreadsheet = SpreadsheetApp.openById(sheetID);

  let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
  let projectData = projectSheet.getDataRange().getValues();

  for (let i = 1; i < projectData.length; ++i)
  {
    if (projectData[i][0] == id)
    {
      console.log(i);
      return i;
    }
  }

  return -1;
}

function addProject(name, start_date, end_date) {
  
  let spreadsheet = SpreadsheetApp.openById(sheetID);

  let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
  let projectData = projectSheet.getDataRange().getValues();

  let errorTitle = "エラー";
  let errorMessage;

  console.log(name);
  console.log(start_date);
  console.log(end_date);

  /* データの確認 */
  if ((name == "") || (start_date == "") || (end_date == ""))
  {
    errorMessage = "設定されていないデータがあります。";
    return errorMessage;
  }

  let projectID;
  let projectName = name;
  let startDate = new Date(start_date);
  let endDate = new Date(end_date);

  console.log(startDate.toDateString());
  console.log(endDate.toDateString());

  /* IDの割り当て */
  if (projectData.length == 1)
  {
    projectID = 1001;
  }
  else
  {
    projectID = ++projectData[projectData.length - 1][0];
  }

  /* 日付チェック */
  if (startDate > endDate)
  {
    errorMessage = "日付エラー";
    console.log(errorMessage);
    return errorMessage;
  }

  /* 日数の計算 */

  let days = 0;
  let holidayData = spreadsheet.getSheetByName("定休日").getDataRange().getValues();
  let calendarId = "ja.japanese#holiday@group.v.calendar.google.com";
  let calendar = CalendarApp.getCalendarById(calendarId);

  for (let i = new Date(startDate); i <= endDate; i.setDate(i.getDate() + 1))
  {
    let youbi = i.getDay();
    if (holidayData[youbi][1] == "休")
    {
      continue;
    }
    if (holidayData[7][1] == "休")
    {
      let event = calendar.getEventsForDay(i);
      if (event.length > 0)
      {
        continue;
      }
    }
    ++days;
  }

  /* プロジェクト一覧に追加 */
  projectSheet.getRange(projectData.length + 1, 1).setValue(projectID);
  projectSheet.getRange(projectData.length + 1, 2).setValue(projectName);
  projectSheet.getRange(projectData.length + 1, 3).setValue(startDate);
  projectSheet.getRange(projectData.length + 1, 4).setValue(endDate);
  projectSheet.getRange(projectData.length + 1, 5).setValue(days);
  projectSheet.getRange(projectData.length + 1, 6).setValue(notStartedYet);

  /* ガントチャート作成 */
  let gantchartSheet = spreadsheet.getSheetByName("ガントチャートテンプレート").copyTo(spreadsheet);
  let sheetname = projectID + "_" + projectName + "_ガントチャート";
  gantchartSheet.setName(sheetname);

  return 0;
}

function addTask(name, id, start_day, end_day, man) {
  let spreadsheet = SpreadsheetApp.openById(sheetID);

  let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
  let projectData = projectSheet.getDataRange().getValues();

  let taskSheet = spreadsheet.getSheetByName("タスク一覧");
  let taskData = taskSheet.getDataRange().getValues();

  let errorTitle = "エラー";
  let errorMessage;

  /* データの確認 */
  if ((name == "") || (id == "") || (start_day == "") || (end_day == "") || (man == ""))
  {
    errorMessage = "設定されていないデータがあります。";
    return errorMessage;
  }

  let taskID;
  let taskName = name;
  let projectID = id;
  let startDate = new Date(start_day);
  let endDate = new Date(end_day);
  let manager = man;

  /* IDの割り当て */
  if (taskData.length == 1)
  {
    taskID = 1001;
  }
  else
  {
    taskID = ++taskData[taskData.length - 1][0];
  }

  /* プロジェクトIDチェック */
  let projectRow;
  for (projectRow = 1; projectRow < projectData.length; ++projectRow)
  {
    if (projectData[projectRow][0] == projectID)
    {
      break;
    }
  }
  if (projectRow == projectData.length)
  {
    errorMessage = "存在しないプロジェクトIDです。";
    return errorMessage;
  }

  /* 日付チェック */
  if (startDate > endDate)
  {
    errorMessage = "日付エラー";
    return errorMessage;
  }
  if (startDate < projectData[projectRow][2] || endDate > projectData[projectRow][3])
  {
    errorMessage = "日付がプロジェクトの範囲外です。";
    return errorMessage;
  }



  /* 日数の計算 */
  let days = 0;
  let holidayData = spreadsheet.getSheetByName("定休日").getDataRange().getValues();
  let calendarId = "ja.japanese#holiday@group.v.calendar.google.com";
  let calendar = CalendarApp.getCalendarById(calendarId);

  for (let i = new Date(startDate); i <= endDate; i.setDate(i.getDate() + 1))
  {
    let youbi = i.getDay();
    if (holidayData[youbi][1] == "休")
    {
      continue;
    }
    if (holidayData[7][1] == "休")
    {
      let event = calendar.getEventsForDay(i);
      if (event.length > 0)
      {
        continue;
      }
    }
    ++days;
  }

  /* タスク一覧に追加 */
  taskSheet.getRange(taskData.length + 1, 1).setValue(taskID);
  taskSheet.getRange(taskData.length + 1, 2).setValue(taskName);
  taskSheet.getRange(taskData.length + 1, 3).setValue(projectID);
  taskSheet.getRange(taskData.length + 1, 4).setValue(projectData[projectRow][1]);
  taskSheet.getRange(taskData.length + 1, 5).setValue(startDate);
  taskSheet.getRange(taskData.length + 1, 6).setValue(endDate);
  taskSheet.getRange(taskData.length + 1, 7).setValue(days);
  taskSheet.getRange(taskData.length + 1, 8).setValue(manager);
  taskSheet.getRange(taskData.length + 1, 9).setValue(notStartedYet);

  /* ガントチャート更新 */
  let gantchartName = projectID + "_" + projectData[projectRow][1] + "_ガントチャート";
  let gantchartSheet = spreadsheet.getSheetByName(gantchartName);
  let gantchartData = gantchartSheet.getDataRange().getValues();
  let gantchartRow = gantchartData.length + 1;

  gantchartSheet.getRange(gantchartRow, 1).setValue(taskID);
  gantchartSheet.getRange(gantchartRow, 2).setValue(taskName);
  gantchartSheet.getRange(gantchartRow, 3).setValue(manager);
  gantchartSheet.getRange(gantchartRow, 4).setValue(startDate);
  gantchartSheet.getRange(gantchartRow, 5).setValue(endDate);
  gantchartSheet.getRange(gantchartRow, 6).setValue(days);
  gantchartSheet.getRange(gantchartRow, 7).setValue(0);

  return 0;

}

function updateProgress(id, percent, memo_input) {
  let spreadsheet = SpreadsheetApp.openById(sheetID);

  let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
  let projectData = projectSheet.getDataRange().getValues();

  let taskSheet = spreadsheet.getSheetByName("タスク一覧");
  let taskData = taskSheet.getDataRange().getValues();

  let progressSheet = spreadsheet.getSheetByName("進捗状況");
  let progressData = progressSheet.getDataRange().getValues();

  let errorTitle = "エラー";
  let errorMessage;

  /* データの確認 */
  if ((id == "") || (percent == ""))
  {
    errorMessage = "設定されていないデータがあります。";
    return errorMessage;
  }

  let taskID = id;
  let progress = percent;
  let memo = memo_input;

  if ((0 > progress) || (100 < progress))
  {
    errorMessage = "進捗率が正しくありません。";
    return errorMessage;
  }

  /* プロジェクトID */
  let i, projectID, taskRow, taskName;
  for (i = 1; i < taskData.length; ++i)
  {
    if (taskID == taskData[i][0])
    {
      taskRow = i;
      taskName = taskData[i][1];
      projectID = taskData[i][2];
      break;
    }
  }
  if (i == taskData.length)
  {
    errorMessage = "存在しないタスクです。";
    return errorMessage;
  }

  /* 状況の更新 */
  if (progress == 100)
  {
    taskSheet.getRange(taskRow + 1, 9).setValue(completed);
  }
  else if (progress == 0)
  {
    taskSheet.getRange(taskRow + 1, 9).setValue(notStartedYet);
  }
  else
  {
    taskSheet.getRange(taskRow + 1, 9).setValue(workInProgress);
  }

  let mikan = 0;
  for (i = i; i < taskData.length; ++i)
  {
    if ((taskData[i][2] == projectID) && (taskData[i][8] != completed))
    {
      if ((taskData[i][0] == taskID) && (progress == 100))
      {

      }
      else
      {
        mikan = 1;
        break;
      }
    }
  }
  let mityakusyu = 0;
  for (i = i; i < taskData.length; ++i)
  {
    if ((taskData[i][2] == projectID) && (taskData[i][8] != notStartedYet))
    {
      if ((taskData[i][0] == taskID) && (progress == 0))
      {

      }
      else
      {
        mityakusyu = 1;
        break;
      }
    }
  }
  let projectRow;
  for (i = 1; i < projectData.length; ++i)
  {
    if (projectData[i][0] == projectID)
    {
      projectRow = i;
      break;
    }
  }
  if ((mikan == 0) && (progress == 100))
  {
    projectSheet.getRange(projectRow + 1, 6).setValue(completed);
  }
  else if ((mityakusyu == 0) && (progress == 0))
  {
    projectSheet.getRange(projectRow + 1, 6).setValue(notStartedYet);
  }
  else
  {
    projectSheet.getRange(projectRow + 1, 6).setValue(workInProgress);
  }

  /* 進捗状況シートに記録 */
  let today = new Date;
  for (i = 1; i < progressData.length; ++i)
  {
    if (taskID == progressData[i][1])
    {
      /* 既存のデータを更新 */
      progressSheet.getRange(i + 1, 4).setValue(progress * 0.01);
      progressSheet.getRange(i + 1, 5).setValue(memo);
      progressSheet.getRange(i + 1, 6).setValue(today);
      break;
    }
  }

  if (i == progressData.length)
  {
    /* 新規のデータを追加 */
    progressSheet.getRange(i + 1, 1).setValue(projectID);
    progressSheet.getRange(i + 1, 2).setValue(taskID);
    progressSheet.getRange(i + 1, 3).setValue(taskName);
    progressSheet.getRange(i + 1, 4).setValue(progress * 0.01);
    progressSheet.getRange(i + 1, 5).setValue(memo);
    progressSheet.getRange(i + 1, 6).setValue(today);
  }


  /* ガントチャートを更新 */
  let gantchartName = projectID + "_" + projectData[projectRow][1] + "_ガントチャート";
  let gantchartSheet = spreadsheet.getSheetByName(gantchartName);
  let gantchartData = gantchartSheet.getDataRange().getValues();
  let gantchartRow;
  for (i = 1; i < gantchartData.length; ++i)
  {
    if (taskID == gantchartData[i][0])
    {
      gantchartRow = i + 1;
      break;
    }
  }

  gantchartSheet.getRange(gantchartRow, 7).setValue(progress);

  return 0;

}

function deleteProject(id) {
  let spreadsheet = SpreadsheetApp.openById(sheetID);

  let taskSheet = spreadsheet.getSheetByName("タスク一覧");
  let taskData = taskSheet.getDataRange().getValues();

  let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
  let projectData = projectSheet.getDataRange().getValues();

  let progressSheet = spreadsheet.getSheetByName("進捗状況");
  let progressData = progressSheet.getDataRange().getValues();

  let errorTitle = "エラー";
  let errorMessage;

  /* データの確認 */
  if (id == "")
  {
    errorMessage = "設定されていないデータがあります。";
    return errorMessage;
  }

  let projectID = id;
  let projectRow, i;
  for (i = 1; i < projectData.length; ++i)
  {
    if (projectData[i][0] == projectID)
    {
      projectRow = i;
      break;
    }
  }
  if (i == projectData.length)
  {
    errorMessage = "存在しないプロジェクトです。";
    return errorMessage;
  }

  /* プロジェクト一覧更新 */
  projectSheet.deleteRow(projectRow + 1);

  /* タスク一覧更新 */
  let tasknum = 0;
  for (i = 1; i < taskData.length; ++i)
  {
    if (taskData[i][2] == projectID)
    {
      taskSheet.deleteRow(i - tasknum + 1);
      ++tasknum;
    }
  }

  /* 進捗状況更新 */
  let progressnum = 0;
  for (i = 1; i < progressData.length; ++i)
  {
    if (progressData[i][0] == projectID)
    {
      progressSheet.deleteRow(i - progressnum + 1);
      ++progressnum;
    }
  }

  /* ガントチャート更新 */
  let gantchartName = projectData[projectRow][0] + "_" + projectData[projectRow][1] + "_ガントチャート";
  let gantchartSheet = spreadsheet.getSheetByName(gantchartName);
  spreadsheet.deleteSheet(gantchartSheet);

  return 0;
}

function deleteTask(id) {
  let spreadsheet = SpreadsheetApp.openById(sheetID);

  let taskSheet = spreadsheet.getSheetByName("タスク一覧");
  let taskData = taskSheet.getDataRange().getValues();

  let projectSheet = spreadsheet.getSheetByName("プロジェクト一覧");
  let projectData = projectSheet.getDataRange().getValues();

  let progressSheet = spreadsheet.getSheetByName("進捗状況");
  let progressData = progressSheet.getDataRange().getValues();

  let errorTitle = "エラー";
  let errorMessage;

  /* データの確認 */
  if (id == "")
  {
    errorMessage = "設定されていないデータがあります。";
    return errorMessage;
  }

  let taskID = id;
  let i, taskRow;
  for (i = 1; i < taskData.length; ++i)
  {
    if (taskData[i][0] == taskID)
    {
      taskRow = i;
      break;
    }
  }
  if (i == taskData.length)
  {
    errorMessage = "存在しないタスクです。";
    return errorMessage;
  }

  let projectRow;
  for (i = 1; i < projectData.length; ++i)
  {
    if (projectData[i][0] == taskData[taskRow][2])
    {
      projectRow = i;
      break;
    }
  }

  let progressRow = 0;
  for (i = 1; i < progressData.length; ++i)
  {
    if (progressData[i][1] == taskID)
    {
      progressRow = i;
      break;
    }
  }

  /* タスク一覧更新 */
  taskSheet.deleteRow(taskRow + 1);

  /* 進捗状況更新 */
  if (progressRow == 0)
  {

  }
  else
  {
    progressSheet.deleteRow(progressRow + 1);
  }

  /* ガントチャート更新 */
  let gantchartName = projectData[projectRow][0] + "_" + projectData[projectRow][1] + "_ガントチャート";
  let gantchartSheet = spreadsheet.getSheetByName(gantchartName);
  let gantchartData = gantchartSheet.getDataRange().getValues();
  let gantchartRow;
  for (i = 1; i < gantchartData.length; ++i)
  {
    if (taskID == gantchartData[i][0])
    {
      gantchartRow = i;
      break;
    }
  }

  gantchartSheet.deleteRow(gantchartRow + 1);

  return 0;
}

function setHoliday(data)
{
  let spreadsheet = SpreadsheetApp.openById(sheetID);

  let holidaySheet = spreadsheet.getSheetByName("定休日");

  for (let i = 0; i < data.length; ++i)
  {
    if (data[i] == 0)
    {
      holidaySheet.getRange(i + 1, 2).setValue("");
    }
    else
    {
      holidaySheet.getRange(i + 1, 2).setValue("休");
    }
  }
  
  return 0;
}

/*
function aleartTask() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadsheet.setSpreadsheetTimeZone("Asia/Tokyo");

  let taskSheet = spreadsheet.getSheetByName("タスク一覧");
  let taskData = taskSheet.getDataRange().getValues();

  let addressSheet = spreadsheet.getSheetByName("連絡先");
  let addressData = addressSheet.getDataRange().getValues();

  let i, j;
  let today = new Date;
  for (i = 1; i < taskData.length; ++i)
  {
    if ((taskData[i][7] != completed) && areDatesEqual(taskData[i][4], today))
    {
      // メール送信
      for (j = 1; j < addressData.length; ++j)
      {
        if (taskData[i][6] == addressData[j][0])
        {
          let mail = addressData[j][1];
          let title = "進捗アラート";
          let body = taskData[i][6] + "様\n\n"
                    + "タスク「" + taskData[i][2] + "」の期限が本日となっています。\n"
                    + "進捗入力がまだの場合は入力をお願いいたします。\n\n"
                    + "以上\n\n" + "進捗管理係";

          GmailApp.sendEmail(mail, title, body);
          break;
        }
      }
    }
  }
}
*/

function convertDayIndexToName(dayIndex) {
  let daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
  return daysOfWeek[dayIndex];
}

function areDatesEqual(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}