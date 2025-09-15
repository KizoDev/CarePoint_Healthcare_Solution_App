import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Import models
import AdminModel from "./Admin.js";
import StaffModel from "./staffs.js";
import ClientModel from "./Client.js";
import ShiftModel from "./Shift.js";
import StaffDocumentModel from "./StaffDocument.js";
import ShiftTemplateModel from "./shiftTemplate.js";
import AuditLogModel from "./Auditlog.js";
import NotificationModel from "./Notification.js";
import AttendanceModel from "./AttendanceRecord.js";
import BenefitPlanModel from "./BenefitPlan.js";
import CarePointAppModel from "./CarePointApplication.js";
import EnrollmentModel from "./Enrollment.js";
import GoalModel from "./Goal.js";
import InterviewModel from "./Interview.js";
import JobApplicationModel from "./JobApplication.js";
import JobPostingModel from "./JobPosting.js";
import LearningCourseModel from "./LearningCourse.js";
import LeaveRequestModel from "./LearningCourse.js";
import OnboardingModel from "./OnboardingTask.js";
import PayrollRunModel from "./PayrollRun.js";
import PayslipModel from "./Payslip.js";
import PerformanceReviewModel from "./PerformanceReview.js";
import StaffBenefitModel from "./StaffBenefit.js";

// Initialize models
const Admin = AdminModel(sequelize, DataTypes);
const Staff = StaffModel(sequelize, DataTypes);
const Client = ClientModel(sequelize, DataTypes);
const Shift = ShiftModel(sequelize, DataTypes);
const StaffDocument = StaffDocumentModel(sequelize, DataTypes);
const ShiftTemplate = ShiftTemplateModel(sequelize, DataTypes);
const AuditLog = AuditLogModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const Attendance = AttendanceModel(sequelize, DataTypes);
const BenefitPlan = BenefitPlanModel(sequelize, DataTypes);
const CarePointApplication = CarePointAppModel(sequelize, DataTypes);
const Enrollment = EnrollmentModel(sequelize, DataTypes);
const Goal = GoalModel(sequelize, DataTypes);
const Interview = InterviewModel(sequelize, DataTypes);
const JobApplication = JobApplicationModel(sequelize, DataTypes);
const JobPosting = JobPostingModel(sequelize, DataTypes);
const LearningCourse = LearningCourseModel(sequelize, DataTypes);
const LeaveRequest = LeaveRequestModel(sequelize, DataTypes);
const Onboarding = OnboardingModel(sequelize, DataTypes);
const PayrollRun = PayrollRunModel(sequelize, DataTypes);
const Payslip = PayslipModel(sequelize, DataTypes);
const PerformanceReview = PerformanceReviewModel(sequelize, DataTypes);
const StaffBenefit = StaffBenefitModel(sequelize, DataTypes);

// Create db object
const db = {
  sequelize,
  Admin,
  Staff,
  Client,
  Shift,
  StaffDocument,
  ShiftTemplate,
  AuditLog,
  Notification,
  Attendance,
  BenefitPlan,
  CarePointApplication,
  Enrollment,
  Goal,
  Interview,
  JobApplication,
  JobPosting,
  LearningCourse,
  LeaveRequest,
  Onboarding,
  PayrollRun,
  Payslip,
  PerformanceReview,
  StaffBenefit,
};

// Setup associations
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
