export type ComponentInfo = {
  id: string;
  nameEn: string;
  nameMy: string;
  descriptionEn: string;
  descriptionMy: string;
  category: "exterior" | "interior" | "electrical" | "mechanical";
};

export const LAB_COMPONENTS: Record<string, ComponentInfo> = {
  cabinet: {
    id: "cabinet",
    nameEn: "Cabinet",
    nameMy: "အပြင်ဘက် ဘောင်",
    descriptionEn: "The outer shell that protects all internal components and houses the display, controls, and mechanisms.",
    descriptionMy: "အတွင်းပိုင်း အစိတ်အပိုင်းအားလုံးကို ကာကွယ်ပေးပြီး မျက်နှာပြင်၊ ခလုတ်များနှင့် စက်ယန္တရားများကို ထည့်သွင်းထားသော အပြင်ဘက်ဘောင်။",
    category: "exterior",
  },
  screen: {
    id: "screen",
    nameEn: "Display Screen",
    nameMy: "မျက်နှာပြင်",
    descriptionEn: "Shows game graphics, scores, and system status to the player.",
    descriptionMy: "ဂိမ်းဂရပ်ဖစ်၊ ရမှတ်များနှင့် စနစ်အခြေအနေများကို ကစားသမားထံ ပြသပေးသည်။",
    category: "exterior",
  },
  medalInput: {
    id: "medalInput",
    nameEn: "Medal Input Slot",
    nameMy: "မဲထည့်သည့် အပေါက်",
    descriptionEn: "The slot where players insert medals to start the game.",
    descriptionMy: "ကစားသမားများ ဂိမ်းစတင်ရန် မဲများထည့်သွင်းသည့် အပေါက်။",
    category: "exterior",
  },
  ticketOutput: {
    id: "ticketOutput",
    nameEn: "Ticket Output",
    nameMy: "လက်မှတ် ထွက်ပေါက်",
    descriptionEn: "Where tickets are dispensed as rewards after playing.",
    descriptionMy: "ကစားပြီးနောက် ဆုလက်မှတ်များ ထွက်လာသည့် နေရာ။",
    category: "exterior",
  },
  controlPanel: {
    id: "controlPanel",
    nameEn: "Control Panel",
    nameMy: "ထိန်းချုပ်ရေး ခလုတ်ခုံ",
    descriptionEn: "Contains buttons and joysticks for player interaction.",
    descriptionMy: "ကစားသမား အပြန်အလှန်ဆက်သွယ်ရန် ခလုတ်များနှင့် Joystick များ ပါဝင်သည်။",
    category: "exterior",
  },
  pusherMotor: {
    id: "pusherMotor",
    nameEn: "Pusher Motor",
    nameMy: "တွန်းအား မော်တာ",
    descriptionEn: "Drives the pusher plate mechanism that moves medals forward.",
    descriptionMy: "မဲများကို ရှေ့သို့ ရွှေ့ပေးသည့် တွန်းအားပြား ယန္တရားကို မောင်းနှင်ပေးသည်။",
    category: "mechanical",
  },
  ticketMotor: {
    id: "ticketMotor",
    nameEn: "Ticket Feed Motor",
    nameMy: "လက်မှတ် ပို့ဆောင် မော်တာ",
    descriptionEn: "Pulls and feeds tickets from the roll to the output slot.",
    descriptionMy: "လက်မှတ်လိပ်မှ လက်မှတ်များကို ဆွဲထုတ်ပြီး ထွက်ပေါက်သို့ ပို့ဆောင်ပေးသည်။",
    category: "mechanical",
  },
  controlBoard: {
    id: "controlBoard",
    nameEn: "Control Board",
    nameMy: "ထိန်းချုပ်ရေး ဘုတ်",
    descriptionEn: "The main circuit board that processes signals and controls all machine operations.",
    descriptionMy: "အချက်ပြမှုများကို လုပ်ဆောင်ပြီး စက်၏ လုပ်ငန်းဆောင်တာအားလုံးကို ထိန်းချုပ်သည့် ပင်မဆားကစ်ဘုတ်။",
    category: "electrical",
  },
  sensor: {
    id: "sensor",
    nameEn: "Medal Sensor",
    nameMy: "မဲ အာရုံခံကိရိယာ",
    descriptionEn: "Detects when a medal passes through and sends a signal to the control board.",
    descriptionMy: "မဲတစ်ခု ဖြတ်သန်းသွားသည့်အခါ ရှာဖွေတွေ့ရှိပြီး ထိန်းချုပ်ရေးဘုတ်သို့ အချက်ပြပေးပို့သည်။",
    category: "electrical",
  },
  medalTray: {
    id: "medalTray",
    nameEn: "Medal Tray",
    nameMy: "မဲ ဗန်း",
    descriptionEn: "Holds medals before they are pushed forward by the pusher mechanism.",
    descriptionMy: "တွန်းအားယန္တရားက ရှေ့သို့ မတွန်းမီ မဲများကို သိမ်းဆည်းထားသည်။",
    category: "mechanical",
  },
  ticketRoll: {
    id: "ticketRoll",
    nameEn: "Ticket Roll",
    nameMy: "လက်မှတ် လိပ်",
    descriptionEn: "The roll of tickets that are dispensed as rewards.",
    descriptionMy: "ဆုလက်မှတ်အဖြစ် ထုတ်ပေးသည့် လက်မှတ်လိပ်။",
    category: "mechanical",
  },
};
