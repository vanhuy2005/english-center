

export const classStats = {
  totalClasses: 45,        
  activeClasses: 28,       
  openClasses: 8,        
  closedClasses: 7,       
  avgStudentsPerClass: 14,
};

export const classStatusData = [
  { name: "Đang hoạt động", value: 28, color: "#10b981" }, 
  { name: "Đang tuyển sinh", value: 8, color: "#3b82f6" }, 
  { name: "Đã đầy", value: 5, color: "#f59e0b" },         
  { name: "Đã kết thúc", value: 4, color: "#ef4444" },    
];

export const classCapacityData = [
  { name: "< 50%", count: 5, fill: "#9ca3af" }, 
  { name: "50-80%", count: 15, fill: "#3b82f6" }, 
  { name: "80-99%", count: 20, fill: "#10b981" }, 
  { name: "100%", count: 5, fill: "#ef4444" },  
];

export const classListData = [
  {
    id: 1,
    classCode: "IEL-INT-01",
    className: "IELTS Intensive K15",
    course: "IELTS Intensive",
    teacher: { fullName: "Nguyễn Văn Anh", avatar: "https://i.pravatar.cc/150?u=101" },
    currentStudents: 18,
    maxStudents: 20,
    status: "active",
  },
  {
    id: 2,
    classCode: "TOE-BAS-03",
    className: "TOEIC Basic Morning",
    course: "TOEIC Basic",
    teacher: { fullName: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=102" },
    currentStudents: 12,
    maxStudents: 15,
    status: "active",
  },
  {
    id: 3,
    classCode: "KID-STA-05",
    className: "Starters for Kids",
    course: "English for Kids",
    teacher: { fullName: "Lê Hữu Đạt", avatar: "https://i.pravatar.cc/150?u=103" },
    currentStudents: 15,
    maxStudents: 15,
    status: "full",
  },
  {
    id: 4,
    classCode: "COM-ADV-02",
    className: "Giao tiếp Nâng cao",
    course: "Giao tiếp Advanced",
    teacher: { fullName: "Trần Thị Bích", avatar: null },
    currentStudents: 8,
    maxStudents: 15,
    status: "open",
  },
  {
    id: 5,
    classCode: "BUS-ENG-01",
    className: "Business English Pro",
    course: "Business English",
    teacher: { fullName: "Phạm Hương Giang", avatar: "https://i.pravatar.cc/150?u=105" },
    currentStudents: 10,
    maxStudents: 10,
    status: "full",
  },
  {
    id: 6,
    classCode: "KID-MOV-01",
    className: "Movers K12",
    course: "English for Kids",
    teacher: null,
    currentStudents: 18,
    maxStudents: 20,
    status: "closed",
  }
];

export const breakdownStats = {
  byLevel: [
    { label: "Beginner", count: 15, color: "bg-blue-500" },
    { label: "Elementary", count: 12, color: "bg-indigo-500" },
    { label: "Intermediate", count: 10, color: "bg-purple-500" },
    { label: "Advanced", count: 8, color: "bg-pink-500" },
  ],
  byTime: [
    { label: "Sáng (07:00 - 11:30)", count: 10, color: "bg-yellow-500" },
    { label: "Chiều (13:30 - 17:00)", count: 12, color: "bg-orange-500" },
    { label: "Tối (17:30 - 21:00)", count: 23, color: "bg-blue-600" },
  ],
  byDay: [
    { label: "Thứ 2-4-6", count: 20, color: "bg-green-500" },
    { label: "Thứ 3-5-7", count: 18, color: "bg-teal-500" },
    { label: "Cuối tuần (T7-CN)", count: 7, color: "bg-purple-500" },
  ],
};