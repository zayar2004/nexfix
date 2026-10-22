export type ScenarioStep = {
  id: string;
  questionEn: string;
  questionMy: string;
  choices: { id: string; textEn: string; textMy: string; isCorrect: boolean }[];
  explanationEn: string;
  explanationMy: string;
};

export type Scenario = {
  id: string;
  titleEn: string;
  titleMy: string;
  symptomEn: string;
  symptomMy: string;
  relatedComponents: string[];
  safetyNoteEn: string;
  safetyNoteMy: string;
  steps: ScenarioStep[];
};

export const LAB_SCENARIOS: Scenario[] = [
  {
    id: "FD-01",
    titleEn: "Medal Detection Failure",
    titleMy: "မဲ ရှာဖွေမှု မအောင်မြင်ခြင်း",
    symptomEn: "The machine does not recognize when a medal is inserted. Game does not start.",
    symptomMy: "မဲထည့်သွင်းသောအခါ စက်က အသိအမှတ်မပြုပါ။ ဂိမ်းမစတင်ပါ။",
    relatedComponents: ["medalInput", "sensor", "controlBoard"],
    safetyNoteEn: "Always power off before inspecting internal components. Do not touch live circuits.",
    safetyNoteMy: "အတွင်းပိုင်း အစိတ်အပိုင်းများကို စစ်ဆေးမီ ပါဝါပိတ်ပါ။ လျှပ်စစ်စီးနေသော ဆားကစ်များကို မထိပါနှင့်။",
    steps: [
      {
        id: "step1",
        questionEn: "What should you check first?",
        questionMy: "ပထမဆုံး ဘာကို စစ်ဆေးသင့်သလဲ?",
        choices: [
          { id: "a", textEn: "Check if the medal sensor is blocked", textMy: "မဲ အာရုံခံကိရိယာ ပိတ်ဆို့နေသလား စစ်ဆေးပါ", isCorrect: true },
          { id: "b", textEn: "Replace the control board", textMy: "ထိန်းချုပ်ရေးဘုတ်ကို အစားထိုးပါ", isCorrect: false },
          { id: "c", textEn: "Check the display screen", textMy: "မျက်နှာပြင်ကို စစ်ဆေးပါ", isCorrect: false },
        ],
        explanationEn: "The medal sensor is the first component in the signal chain. If it is blocked or dirty, no signal reaches the control board.",
        explanationMy: "မဲ အာရုံခံကိရိယာသည် အချက်ပြလမ်းကြောင်း၏ ပထမဆုံး အစိတ်အပိုင်းဖြစ်သည်။ ပိတ်ဆို့နေပါက ထိန်းချုပ်ရေးဘုတ်သို့ အချက်ပြမရောက်ပါ။",
      },
      {
        id: "step2",
        questionEn: "The sensor is clean. What should you check next?",
        questionMy: "အာရုံခံကိရိယာ သန့်ရှင်းနေသည်။ နောက်ဘာကို စစ်ဆေးသင့်သလဲ?",
        choices: [
          { id: "a", textEn: "Check the sensor connection cable", textMy: "အာရုံခံကိရိယာ ကြိုးကို စစ်ဆေးပါ", isCorrect: true },
          { id: "b", textEn: "Replace the medal tray", textMy: "မဲ ဗန်းကို အစားထိုးပါ", isCorrect: false },
          { id: "c", textEn: "Check the ticket motor", textMy: "လက်မှတ် မော်တာကို စစ်ဆေးပါ", isCorrect: false },
        ],
        explanationEn: "If the sensor is clean, the connection cable between the sensor and control board should be inspected for damage or loose connections.",
        explanationMy: "အာရုံခံကိရိယာ သန့်ရှင်းပါက အာရုံခံကိရိယာနှင့် ထိန်းချုပ်ရေးဘုတ်ကြား ကြိုးကို ပျက်စီးမှု သို့မဟုတ် လျော့နေမှု စစ်ဆေးသင့်သည်။",
      },
    ],
  },
  {
    id: "FD-02",
    titleEn: "Pusher Motor Does Not Move",
    titleMy: "တွန်းအား မော်တာ မလှုပ်ရှားခြင်း",
    symptomEn: "The pusher plate does not push medals forward.",
    symptomMy: "တွန်းအားပြားက မဲများကို ရှေ့သို့ မတွန်းပါ။",
    relatedComponents: ["pusherMotor", "controlBoard", "medalTray"],
    safetyNoteEn: "Power off before checking the motor. The motor may be hot.",
    safetyNoteMy: "မော်တာကို မစစ်ဆေးမီ ပါဝါပိတ်ပါ။ မော်တာ ပူနေနိုင်သည်။",
    steps: [
      {
        id: "step1",
        questionEn: "What is the safest first check?",
        questionMy: "အန္တရာယ်အကင်းဆုံး ပထမဆုံး စစ်ဆေးမှုက ဘာလဲ?",
        choices: [
          { id: "a", textEn: "Check for physical obstruction", textMy: "ရုပ်ပိုင်းဆိုင်ရာ ပိတ်ဆို့မှု ရှိမရှိ စစ်ဆေးပါ", isCorrect: true },
          { id: "b", textEn: "Replace the control board", textMy: "ထိန်းချုပ်ရေးဘုတ်ကို အစားထိုးပါ", isCorrect: false },
          { id: "c", textEn: "Add more medals", textMy: "မဲများ ထပ်ထည့်ပါ", isCorrect: false },
        ],
        explanationEn: "Physical obstruction is a common, safe-to-check cause. Look for jammed medals in the pusher path.",
        explanationMy: "ရုပ်ပိုင်းဆိုင်ရာ ပိတ်ဆို့မှုသည် အဖြစ်များပြီး စစ်ဆေးရ လုံခြုံသော အကြောင်းရင်းဖြစ်သည်။ တွန်းအားလမ်းကြောင်းတွင် ပိတ်မိနေသော မဲများကို ရှာပါ။",
      },
    ],
  },
  {
    id: "FD-03",
    titleEn: "Ticket Does Not Dispense",
    titleMy: "လက်မှတ် မထုတ်ပေးခြင်း",
    symptomEn: "Player wins but no ticket comes out.",
    symptomMy: "ကစားသမား အနိုင်ရသော်လည်း လက်မှတ် မထွက်ပါ။",
    relatedComponents: ["ticketRoll", "ticketMotor", "ticketOutput"],
    safetyNoteEn: "Do not force the ticket roll. Power off before inspecting the feed path.",
    safetyNoteMy: "လက်မှတ်လိပ်ကို အတင်းမဆွဲပါ။ ပို့ဆောင်လမ်းကြောင်းကို မစစ်ဆေးမီ ပါဝါပိတ်ပါ။",
    steps: [
      {
        id: "step1",
        questionEn: "What should you check first?",
        questionMy: "ပထမဆုံး ဘာကို စစ်ဆေးသင့်သလဲ?",
        choices: [
          { id: "a", textEn: "Check if the ticket roll is empty", textMy: "လက်မှတ်လိပ် ကုန်နေသလား စစ်ဆေးပါ", isCorrect: true },
          { id: "b", textEn: "Replace the sensor", textMy: "အာရုံခံကိရိယာကို အစားထိုးပါ", isCorrect: false },
          { id: "c", textEn: "Reset the game", textMy: "ဂိမ်းကို ပြန်လည်သတ်မှတ်ပါ", isCorrect: false },
        ],
        explanationEn: "The most common cause of ticket dispensing failure is an empty or nearly empty ticket roll.",
        explanationMy: "လက်မှတ် မထုတ်ပေးခြင်း၏ အဖြစ်အများဆုံး အကြောင်းရင်းမှာ လက်မှတ်လိပ် ကုန်နေခြင်း သို့မဟုတ် ကုန်ခါနီးဖြစ်ခြင်းဖြစ်သည်။",
      },
    ],
  },
  {
    id: "FD-04",
    titleEn: "Ticket Feed Stops",
    titleMy: "လက်မှတ် ပို့ဆောင်မှု ရပ်တန့်ခြင်း",
    symptomEn: "Tickets are dispensed but the feed stops intermittently.",
    symptomMy: "လက်မှတ်များ ထွက်သော်လည်း ပို့ဆောင်မှု ရပ်တန့်သွားသည်။",
    relatedComponents: ["ticketMotor", "ticketRoll", "ticketOutput"],
    safetyNoteEn: "Inspect the feed path only after powering off.",
    safetyNoteMy: "ပါဝါပိတ်ပြီးမှသာ ပို့ဆောင်လမ်းကြောင်းကို စစ်ဆေးပါ။",
    steps: [
      {
        id: "step1",
        questionEn: "Where would you look for obstruction?",
        questionMy: "ပိတ်ဆို့မှုကို ဘယ်နေရာမှာ ရှာမလဲ?",
        choices: [
          { id: "a", textEn: "Between the roll and the feed rollers", textMy: "လိပ်နှင့် ပို့ဆောင် roller ကြား", isCorrect: true },
          { id: "b", textEn: "Inside the control board", textMy: "ထိန်းချုပ်ရေးဘုတ် အတွင်း", isCorrect: false },
          { id: "c", textEn: "Near the display screen", textMy: "မျက်နှာပြင် အနီး", isCorrect: false },
        ],
        explanationEn: "Torn tickets often jam between the roll and the feed rollers — the most common blockage point.",
        explanationMy: "စုတ်ပြဲနေသော လက်မှတ်များသည် လိပ်နှင့် ပို့ဆောင် roller ကြားတွင် ပိတ်မိတတ်သည် — အဖြစ်အများဆုံး ပိတ်ဆို့သည့်နေရာ။",
      },
    ],
  },
  {
    id: "FD-05",
    titleEn: "Screen Works But Controls Do Not Respond",
    titleMy: "မျက်နှာပြင် အလုပ်လုပ်သော်လည်း ခလုတ်များ မတုံ့ပြန်ခြင်း",
    symptomEn: "Display shows normally, but button presses have no effect.",
    symptomMy: "မျက်နှာပြင် ပုံမှန်ပြသော်လည်း ခလုတ်နှိပ်ခြင်းက အာနိသင်မရှိပါ။",
    relatedComponents: ["controlPanel", "controlBoard"],
    safetyNoteEn: "Never insert tools or objects into button housings.",
    safetyNoteMy: "ခလုတ်အပေါက်များထဲသို့ ကိရိယာများ သို့မဟုတ် အရာဝတ္ထုများ မထည့်ပါနှင့်။",
    steps: [
      {
        id: "step1",
        questionEn: "What is the most likely cause?",
        questionMy: "အဖြစ်နိုင်ဆုံး အကြောင်းရင်းက ဘာလဲ?",
        choices: [
          { id: "a", textEn: "Control panel wiring or connection issue", textMy: "ထိန်းချုပ်ရေး ခလုတ်ခုံ ကြိုး သို့မဟုတ် ချိတ်ဆက်မှု ပြဿနာ", isCorrect: true },
          { id: "b", textEn: "Display screen failure", textMy: "မျက်နှာပြင် ပျက်စီးခြင်း", isCorrect: false },
          { id: "c", textEn: "Ticket roll empty", textMy: "လက်မှတ်လိပ် ကုန်ခြင်း", isCorrect: false },
        ],
        explanationEn: "If the screen works, the board is receiving power. The most likely issue is the control panel's connection.",
        explanationMy: "မျက်နှာပြင် အလုပ်လုပ်ပါက ဘုတ်သည် ပါဝါရနေသည်။ အဖြစ်နိုင်ဆုံး ပြဿနာမှာ ထိန်းချုပ်ရေး ခလုတ်ခုံ၏ ချိတ်ဆက်မှုဖြစ်သည်။",
      },
    ],
  },
  {
    id: "FD-06",
    titleEn: "Sensor Error",
    titleMy: "အာရုံခံကိရိယာ အမှား",
    symptomEn: "Machine displays a sensor error or behaves erratically.",
    symptomMy: "စက်က အာရုံခံကိရိယာ အမှား ပြသသည် သို့မဟုတ် မမှန်မကန် ပြုမူသည်။",
    relatedComponents: ["sensor", "controlBoard"],
    safetyNoteEn: "Refer to official service documentation for electrical diagnostics.",
    safetyNoteMy: "လျှပ်စစ်ဆိုင်ရာ စစ်ဆေးမှုများအတွက် တရားဝင် ဝန်ဆောင်မှု စာရွက်စာတမ်းများကို ကိုးကားပါ။",
    steps: [
      {
        id: "step1",
        questionEn: "What is the safest first check?",
        questionMy: "အန္တရာယ်အကင်းဆုံး ပထမဆုံး စစ်ဆေးမှုက ဘာလဲ?",
        choices: [
          { id: "a", textEn: "Check for dirt or debris on the sensor", textMy: "အာရုံခံကိရိယာပေါ်တွင် အညစ်အကြေး ရှိမရှိ စစ်ဆေးပါ", isCorrect: true },
          { id: "b", textEn: "Bypass the sensor", textMy: "အာရုံခံကိရိယာကို ကျော်လွှားပါ", isCorrect: false },
          { id: "c", textEn: "Increase the game difficulty", textMy: "ဂိမ်း အခက်အခဲ တိုးပါ", isCorrect: false },
        ],
        explanationEn: "Dirt and debris on sensors are common, safe-to-check causes of false sensor errors.",
        explanationMy: "အာရုံခံကိရိယာများပေါ်ရှိ အညစ်အကြေးများသည် မှားယွင်းသော အာရုံခံ အမှားများ၏ အဖြစ်များပြီး စစ်ဆေးရ လုံခြုံသော အကြောင်းရင်းများဖြစ်သည်။",
      },
    ],
  },
];
