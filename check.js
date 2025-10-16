const { Staff,Department } = require("../models"); 
const { staffSchema } = require("../validations/staffFormValidation"); 
const { validatePhoneNumber } = require('../validations/numberValidator');
const { validatePermissions } = require('../validations/permissionValidator');
const nodemailer = require('nodemailer')
const { Op } = require("sequelize"); 
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {updatePasswordSchema } = require('../validations/updatePasswordSchema')
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const randompassword = require("../middlewares/passwordReset");


let mailTransporter = nodemailer.createTransport({
  host: "mail.skilltopims.com",  
  port: 587, 
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const getDepartmentIdByName = async (departmentName) => {
  const department = await Department.findOne({
    where: { name: departmentName }, 
  });
  return department ? department.deptId : null;
};

const getDepartmentNameById = async (deptId) => {
  const department = await Department.findOne({
    where: { deptId }, 
    attributes: ['name'], // Fetch only the name field
  });
  return department ? department.name : null;
};


exports.createStaff = async (req, res) => {
  try {
    // Validate the request body
    const { error } = staffSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
  const {firstName, lastName, role, departmentName, specialization, shiftSchedule, employStatus, location, dateOfHire, yrOfExperience, email, phone,dateOfBirth,gender,licence,educationalQualification} = req.body;
  const deptId = await getDepartmentIdByName(departmentName);

  if (!deptId) {
    return res.status(400).json({ error: "Invalid department name" });
  }
  if (!validatePhoneNumber(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }
  if (await Staff.findOne({ where: { email} })) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  if (await Staff.findOne({ where: { phone} })) {
  return res.status(400).json({ error: 'Phone number already exists' });
 }
  // Create the staff in the database
  const staff = await Staff.create({
    firstName, 
    lastName, 
    role, 
    deptId, 
    specialization, 
    shiftSchedule, 
    employStatus, 
    location, 
    dateOfHire, 
    yrOfExperience, 
    email, 
    phone,
    dateOfBirth,
    gender,
    licence,
    educationalQualification
});
    // Get the department name for the response
    const departmentNameResponse = await getDepartmentNameById(staff.deptId);

    // response object
    const response = {
      staffId: staff.staffId,
      staffStatus: staff.staffStatus,
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
      departmentName: departmentNameResponse, 
      specialization: staff.specialization,
      shiftSchedule: staff.shiftSchedule,
      employStatus: staff.employStatus,
      location: staff.location,
      dateOfHire: staff.dateOfHire,
      yrOfExperience: staff.yrOfExperience,
      email: staff.email,
      phone: staff.phone,
      dateOfBirth: staff.dateOfBirth,
      gender: staff.gender,
      licence: staff.licence,
      educationalQualification: staff.educationalQualification,
      profileUrl: staff.profileUrl,
      password: staff.password,
      vacationDays: staff.vacationDays,
      permission: staff.permission
    };
res.status(201).json(response);
} catch (error) {
  res.status(404).json({ error: error.message });
}
}


exports.viewStaff = async (req, res) => {
  try {
    // Extracting user information from the JWT token
    const { userId, role } = req.user;
    const { staffId } = req.params;

    // Fetch the staff details along with the department name
    const staff = await Staff.findOne({
      where: { staffId },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['name'] // Only fetch the department's name
      }]
    });

    // Check if staff member exists
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // Authorize the request: only Super Admin, Admin, or the staff member themselves can view the profile
    if (role === 'Super Admin' || role === 'Admin' || userId === staffId) {
      
      // Prepare the response object, including only the necessary staff details and department name
      const response = {
        staffId: staff.staffId,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        shiftSchedule: staff.shiftSchedule,
        dateOfHire: staff.dateOfHire,
        gender: staff.gender,
        employStatus: staff.employStatus,
        staffStatus: staff.staffStatus,
        phone: staff.phone,
        educationalQualification: staff.educationalQualification,
        yrOfExperience: staff.yrOfExperience,
        licence: staff.licence,
        specialization: staff.specialization,
        location: staff.location,
        dateOfBirth: staff.dateOfBirth,
        role: staff.role,
        departmentName: staff.department ? staff.department.name : null // Add department name if available
      };

      // Send the response
      return res.status(200).json(response);
    }

    // If the user is not authorized, send a forbidden status
    return res.status(403).json({ error: "Access denied. You do not have permission to view this profile." });

  } catch (error) {
    // Handle any unexpected errors
    return res.status(500).json({ error: error.message });
  }
};


exports.editStaff = async (req, res) => {
  try {
    const { userId, role: userRole } = req.user;  // Get the current user's ID and role
    const { staffId } = req.params;  // The ID of the staff being edited

    // Find the staff by ID
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // Only allow Superadmin, Admin, or the staff member themselves to edit the profile
    if (userRole !== 'Super Admin' && userRole !== 'Admin'){ //&& userId !== staff.staffId) {
      return res.status(403).json({ error: "You do not have permission to edit this staff profile" });
    }

    // Extract fields from the request body
    const {
      firstName, lastName, newRole, departmentName, specialization, shiftSchedule, employStatus, 
      location, dateOfHire, yrOfExperience, email, phone, dateOfBirth, gender, 
      licence, educationalQualification
    } = req.body; 

    // If email is provided and different from current, check for duplicates
    if (email && email !== staff.email) {
      const emailExists = await Staff.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // If phone is provided and different from current, check for duplicates
    if (phone && phone !== staff.phone) {
      if (!validatePhoneNumber(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
      const phoneExists = await Staff.findOne({ where: { phone } });
      if (phoneExists) {
        return res.status(400).json({ error: 'Phone number already exists' });
      }
    }

    // Get the departmentId by departmentName
    let deptId;
    if (departmentName) {
      deptId = await getDepartmentIdByName(departmentName);
      if (!deptId) {
        return res.status(400).json({ error: "Invalid department name" });
      }
    }

    // Update only the fields that are provided (undefined fields will be ignored)
    await staff.update({
      firstName: firstName || staff.firstName,
      lastName: lastName || staff.lastName,
      role: newRole || staff.role,  // Use newRole here
      deptId: deptId || staff.deptId,
      specialization: specialization || staff.specialization,
      shiftSchedule: shiftSchedule || staff.shiftSchedule,
      employStatus: employStatus || staff.employStatus,
      location: location || staff.location,
      dateOfHire: dateOfHire || staff.dateOfHire,
      yrOfExperience: yrOfExperience || staff.yrOfExperience,
      email: email || staff.email,
      phone: phone || staff.phone,
      dateOfBirth: dateOfBirth || staff.dateOfBirth,
      gender: gender || staff.gender,
      licence: licence || staff.licence,
      educationalQualification: educationalQualification || staff.educationalQualification
    });

    // Return the updated staff data, with departmentName included
    const response = {
      staffId: staff.staffId,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      shiftSchedule: staff.shiftSchedule,
      dateOfHire: staff.dateOfHire,
      gender: staff.gender,
      employStatus: staff.employStatus,
      phone: staff.phone,
      educationalQualification: staff.educationalQualification,
      yrOfExperience: staff.yrOfExperience,
      licence: staff.licence,
      specialization: staff.specialization,
      location: staff.location,
      dateOfBirth: staff.dateOfBirth,
      role: staff.role,  // Ensure this returns the updated role
      departmentName: departmentName || (staff.department ? staff.department.name : null)  // Set departmentName from request or keep existing
    };

    // Return the updated staff data
    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.deleteStaff = async (req, res) => {
  try {
    // Get the staff ID from the request params
    const staffId = req.params.staffId;

    // Check if the staff member exists
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // Delete the staff member from the database
    await staff.destroy();
    res.status(200).json({ message: "Staff deleted successfully" });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 

exports.searchStaff = async (req, res) => {
  try {
    // Extract the search value from the query parameters
    const { searchValue } = req.query;

    if (!searchValue) {
      return res.status(400).json({ error: "Search value is required" });
    }

    // Enum values for role
    const validRoles = ['Doctor', 'Nurse', 'Admin']; 

    //search criteria to match fields
    const searchCriteria = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchValue}%` } }, 
        { lastName: { [Op.iLike]: `%${searchValue}%` } },  
        { email: { [Op.iLike]: `%${searchValue}%` } },    
      ]
    };

    // Check if the searchValue is a valid role
    if (validRoles.includes(searchValue)) {
      searchCriteria[Op.or].push({ role: searchValue }); 
    }

   // Fetch staff members including their department information
const staff = await Staff.findAll({
  where: searchCriteria,
  include: [
    {
      model: Department,
      as: 'department',
      attributes: ['name'], 
    }
  ]
});
    // If no staff members are found
    if (staff.length === 0) {
      return res.status(404).json({ message: "No staff members found matching the search criteria" });
    }

// Format the response to include departmentName instead of deptId
const formattedStaff = staff.map(staffMember => {
  return {
    staffId: staffMember.staffId,
    firstName: staffMember.firstName,
    lastName: staffMember.lastName,
    email: staffMember.email,
    role: staffMember.role,
    shiftSchedule: staffMember.shiftSchedule,
    employStatus: staffMember.employStatus,
    phone: staffMember.phone,
    educationalQualification: staffMember.educationalQualification,
    yrOfExperience: staffMember.yrOfExperience,
    licence: staffMember.licence,
    specialization: staffMember.specialization,
    location: staffMember.location,
    dateOfBirth: staffMember.dateOfBirth,
    gender: staffMember.gender,
    departmentName: staffMember.department ? staffMember.department.name : null // Access department name
  };
});
    // Return the search results
    res.status(200).json(formattedStaff);

  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: error.message });
  }
};


exports.allDoctors = async (req, res) => {
  try {
    // Get pagination parameters from query string, with default values
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const offset = (page - 1) * limit; 

    // Fetch doctors from the staff table where role is 'Doctor'
    const { count, rows } = await Staff.findAndCountAll({
      where: { role: 'Doctor' },
      limit: limit,
      offset: offset,
      include: [
        {
          model: Department, 
          as: 'department',   
          attributes: ['name'] 
        }
      ]
    });

    // Format the response to include department name instead of deptId
    const formattedDoctors = rows.map(doctor => {
      return {
        staffId: doctor.staffId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        role: doctor.role,
        shiftSchedule: doctor.shiftSchedule,
        employStatus: doctor.employStatus,
        phone: doctor.phone,
        educationalQualification: doctor.educationalQualification,
        yrOfExperience: doctor.yrOfExperience,
        licence: doctor.licence,
        specialization: doctor.specialization,
        location: doctor.location,
        dateOfBirth: doctor.dateOfBirth,
        gender: doctor.gender,
        departmentName: doctor.department ? doctor.department.name : null // Access department name
      };
    });

    // Return paginated data
    res.status(200).json({
      totalDoctors: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      doctors: formattedDoctors // Use formattedDoctors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.allNurses = async (req, res) => {
  try {
    // Get pagination parameters from query string, with default values
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; // Default to 10 per page
    const offset = (page - 1) * limit; // Calculate offset 

    // Fetch doctors from the staff table where role is 'Doctor'
    const { count, rows } = await Staff.findAndCountAll({
      where: { role: 'Nurse' },
      limit: limit,
      offset: offset,
      include: [
        {
          model: Department, 
          as: 'department',   
          attributes: ['name'] 
        }
      ]
    });

    // Format the response to include department name instead of deptId
    const formattedNurses = rows.map(nurse => {
      return {
        staffId: nurse.staffId,
        firstName: nurse.firstName,
        lastName: nurse.lastName,
        email: nurse.email,
        role: nurse.role,
        shiftSchedule: nurse.shiftSchedule,
        employStatus: nurse.employStatus,
        phone: nurse.phone,
        educationalQualification: nurse.educationalQualification,
        yrOfExperience: nurse.yrOfExperience,
        licence: nurse.licence,
        specialization: nurse.specialization,
        location: nurse.location,
        dateOfBirth: nurse.dateOfBirth,
        gender: nurse.gender,
        departmentName: nurse.department ? nurse.department.name : null 
      };
    });

    // Return paginated data
    res.status(200).json({
      totalNurses: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      nurse: formattedNurses 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.inviteStaff = async (req, res) => {
  try {
    const { email, password, userName } = req.body;
    if (!email || !password || !userName) {
      return res.status(400).json({ message: 'Invalid credentials, request must contain staffs proposed "email" ,"password" and "userName"' });
    }
     // Check if the userName is already in use by someone else
    const existingUserName = await Staff.findOne({ where: { userName: userName } });
    if (existingUserName) {
      return res.status(409).json({ message: 'User name already exists. Please make a more unique one.' });
    }
     // Check if the user already exists by email
     const existingStaff = await Staff.findOne({ where: { email: email } });
   
     // If staff exists, check if they have already been invited
     if (existingStaff) {
       if (existingStaff.userName) {
         // userName is not null, so this staff member has already been invited
         return res.status(409).json({ message: `Staff with email ${email} has previously been invited, kindly verify the email and try again` });
       }
      const hashedPassword = await bcrypt.hash(password, 10);
      existingStaff.userName = userName || staff.userName;
      existingStaff.password = hashedPassword;
      existingStaff.status = 'pending';
      await existingStaff.save();

      let mailOption = {
        from: process.env.EMAIL_USER,
        to: existingStaff.email,
        subject: "You have been invited as a Staff Member",
        html: `<h2>Hi ${existingStaff.userName},</h2>
        <p>You have been invited to join Our Hospital as a staff member.</p>
        <p>Please use the credentials below to log in by clicking on this <a href="${process.env.CLIENT_URL}">link</a>:</p>
        <p>Email: ${existingStaff.email}<br>Password: ${password}</p>`
      };

      mailTransporter.sendMail(mailOption);

      return res.status(200).json({
        success: true,
        message: 'Staff onboarded successfully and invite sent',
        data: {
          id: existingStaff.id,
          email: existingStaff.email,
          status: existingStaff.status,
          role: existingStaff.role,
        },
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newStaff = await Staff.create({
        userName,
        email,
        password: hashedPassword,
        addedDate: new Date(),
        status: 'active',
        role: 'Doctor',
      });

      let mailOption = {
        from: process.env.EMAIL_USER,
        to: newStaff.email,
        subject: "You have been invited as a Staff Member",
        html: `<h2>Hi ${newStaff.userName},</h2>
        <p>You have been invited to join Our Hospital as a staff member.</p>
        <p>Please use the credentials below to log in by clicking on this <a href="${process.env.CLIENT_URL}">link</a>:</p>
        <p>Email: ${newStaff.email}<br>Password: ${password}</p>`
      };

      mailTransporter.sendMail(mailOption);

      return res.status(201).json({
        success: true,
        message: 'New staff created and invite sent',
        data: {
          id: newStaff.id,
          email: newStaff.email,
          status: newStaff.status,
          role: newStaff.role,
        },
      });
    }
  } catch (err) {
    // Catch and log any unexpected errors
    console.error('Error inviting staff:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while trying to invite staff , kindly ensure the staff is registered before onboarding ',
      error: err.message,
    });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  const staff = await Staff.findOne({ where: { email } });
  if (!staff) {
    return res.status(400).send("Email is not registered");
  }

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) {
    return res.status(404).json({ msg: "Incorrect login details" });
  } else {
    const token = jwt.sign(
      { id: staff.staffId, username: staff.userName, email: staff.email, role: staff.role, permission: staff.permission },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.json({ token, id: staff.staffId, userName: staff.userName, email: staff.email, role: staff.role });
  }
};


exports.updateStaff = async (req, res) => {
  try {
    // Get the staff ID from the request params
    const staffId = req.params.staffId;

    // Find the staff by ID first
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    if (!staff.userName) {
      return res.status(400).json({ error: "Staff has not been invited yet. You cannot update their details." });
    }
   
    // Extract only the fields that are provided in the request body
    const { userName,email, departmentName,role, staffStatus , permission} = req.body;

    // Check for duplicate userName, excluding the current staff ID
    if (userName && userName !== staff.userName) {
      const existingUserName = await Staff.findOne({ 
        where: { 
          userName: userName,
          staffId: { [Op.ne]: staffId } // Exclude the current staff by ID
        } 
      });
      if (existingUserName) {
        return res.status(409).json({ message: 'User name already exists. Please make a more unique User name.' });
      }
    }

    // If email is provided and different from current, check for duplicates
    if (email && email !== staff.email) {
      const emailExists = await Staff.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

     // Get the departmentId by departmentName
     let deptId;
     if (departmentName) {
       deptId = await getDepartmentIdByName(departmentName);
       if (!deptId) {
         return res.status(400).json({ error: "Invalid department name" });
       }
     }

     if (!permission || !Array.isArray(permission) || !validatePermissions(permission)) {
      return res.status(400).json({ error: "Invalid permissions format" });
    }

    // Update
    await staff.update({
      userName : userName || staff.userName,
      email: email || staff.email,
      deptId: deptId || staff.deptId,
      role: role || staff.role,
      staffStatus : staffStatus || staff.staffStatus,
      permission:permission || staff.permission
    });

    // Reponse
    const response = {
      staffId: staff.staffId,
      userName : staff.userName,
      email: staff.email,
      departmentName: departmentName || (staff.department ? staff.department.name : null),
      role: staff.role,
      staffStatus : staff.staffStatus,
      permissions : staff.permission
    };

    // Return the updated staff data
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createSuperAdmin = async function createSuperAdmin() {
  try {
    // Check if Super Admin already exists
    const superAdmin = await Staff.findOne({ where: { role: 'Super Admin' } });
    
    if (!superAdmin) {
      // Hash password
      const hashedPassword = await bcrypt.hash('supersecretpassword', 10);  // Customizable 
      
      // Create Super Admin , all values are customizable
      const newSuperAdmin = await Staff.create({
        userName: 'superadmin1',
        email: 'superadmin@example.com', 
        password: hashedPassword,
        role: 'Super Admin',
        status: 'active',
        addedDate: new Date(),
        firstName: 'Super',             
        lastName: 'Admin',
        dateOfHire: new Date(),
        gender: 'Other',
        phone: '0000000001',
        educationalQualification: 'N/A',
        yrOfExperience: 0,
        specialization: 'N/A',
        dateOfBirth: new Date(1970, 0, 1),
        permission: [
          { label: 'Department', view: true, create: true, edit: true, transfer: true, delete: true},
          { label: 'Staff', view: true, create: true, edit: true, transfer: true, delete: true },
          { label: 'Patients', view: true, create: true, edit: true, transfer: true, delete: true },
          { label: 'Appointments', view: true, create: true, edit: true, transfer: true, delete: true  },
          { label: 'Accounts', view: true, create: true, edit: true, transfer: true, delete: true  },
          { label: 'Reports', view: true, create: true, edit: true, transfer: true, delete: true  },
        ]
      });
      console.log('Super Admin created successfully');
    } else {
      // If Super Admin already exists, log a message
      console.log('Super Admin already exists');
    }
  } catch (error) {
    console.error('Error creating Super Admin:', error);
  }
}



exports.updatePermissions = async (req, res) => {
  try {
    // Extract staff ID from params
    const { staffId } = req.params;
    
    // Extract new permissions from request body
    const { permissions } = req.body;
    if (!permissions || !Array.isArray(permissions) || !validatePermissions(permissions)) {
      return res.status(400).json({ error: "Invalid permissions format" });
    }

    // Find the staff member by ID
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // Update the permissions field
    await staff.update({ permission: permissions });

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      data: {
        staffId: staff.staffId,
        permissions: staff.permission,
      },
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ error: "An error occurred while updating permissions" });
  }
};
  

// Change staff password
exports.changePassword = async (req, res) => {
  const { oldPassword, password, confirmPassword } = req.body;

  // Validate details
  const check = updatePasswordSchema.validate(req.body);
  if (check.error) {
    return res.status(400).json({ error: check.error.details[0].message });
  }

  const { email } = req.user;

  try {
    // Check if the staff exists
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return res.status(404).json({ msg: "Staff with the provided email does not exist" });
    }

    console.log("Old password (plaintext):", oldPassword);
    console.log("Stored hashed password:", staff.password);

    // Check if old password matches the current password
    const isMatch = await bcrypt.compare(oldPassword, staff.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect old password" });
    }

    // Check if new password matches confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "New password must match the confirmation" });
    }

    // Hash the new password
    const hash = await bcrypt.hash(password, 10);

    // Update the staff's password
    const [updated] = await Staff.update(
      { password: hash },
      { where: { email } }
    );

    if (updated) {
      return res.status(200).json({ msg: "Staff password updated successfully" });
    } else {
      return res.status(500).json({ msg: "Password update failed" });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ msg: "An error occurred while updating the password" });
  }
};

//PROFILE 
// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = file.mimetype;
    if (ext !== 'image/jpeg' && ext !== 'image/png' && ext !== 'image/jpg') {
      return cb(new Error('File type is not supported'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Limit size to 5MB
});

// Upload Profile Picture
exports.uploadProfilePic = async (req, res) => {

  // Use multer to handle the file upload
  upload.single('profilePic')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { userId } = req.user; // Get Id from the middleware

      // Find the staff member using userId
      const staff = await Staff.findByPk(userId);
      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Upload image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'profile_pics' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }).end(req.file.buffer);
      });

      // Update profileUrl with Cloudinary URL
      staff.profileUrl = result.secure_url;
      await staff.save();

   //Response
      res.status(200).json({ message: 'Profile picture uploaded successfully', profileUrl: staff.profileUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};


exports.getProfilePic = async (req, res) => {
  try {
    // Get Id 
    const staffId = req.user.userId;

    // Fetch staff data 
    const staff = await Staff.findByPk(staffId);

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // display profile picture URL or null if not set
    res.json({ profilePic: staff.profileUrl || null });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve profile picture" });
  }
};



//RESET PASSWORD
exports.passwordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // Find staff by email
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return res.status(404).json({ msg: "Staff member does not exist" });
    }

    // Generate a random token for password reset link
    let randomText = randompassword.generateRandomPassword(50);
    let transporter = nodemailer.createTransport({
      host: "mail.skilltopims.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Construct the password reset link
    const resetLink = `${process.env.CLIENT2_URL}/passwordConfirmation?token=${randomText}&email=${email}`;

    let mailOptions = {
      from: {
        name: "IMS Password Reset",
        address: process.env.EMAIL_USER,
      },
      to: staff.email,
      subject: "IMS Reset Link",
      html: `<a href="${resetLink}">Click here to reset your password</a>`,
    };

    // Send email with reset link
    await transporter.sendMail(mailOptions);
    res.json({
      msg: "An email has been sent to you with a link to reset your password. If not seen in your inbox, please check your spam.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "An error occurred while sending the email." });
  }
};

//*********** Reset Password Submission *********/
exports.resetSubmit = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Validate reset password req body
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Password mismatch." });
  }

  try {
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return res.status(400).json({ msg: "Enter a correct email address" });
    }

    // Hash the new password
    const hash = await bcrypt.hash(password, 10);
    
    // Update new password in the db
    const updatedPassword = await Staff.update(
      { password: hash },
      { where: { email: email } }
    );

    if (updatedPassword[0] === 0) { // Check if update was successful
      return res.status(404).json({ msg: "Password reset failed" });
    }

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "An error occurred while resetting the password." });
  }
};

exports.getAllStaffs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const totalStaff = await Staff.count();

    const staffData = await Staff.findAll({
      where: {
        userName: {
          [Op.ne]: null, 
        },
      },
      attributes: ['staffId','userName', 'email', 'createdAt', 'staffStatus', 'role','permission'],
      limit: limit,
      offset: offset,
      order: [['staffId', 'ASC']], 
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['name'], 
        },
      ],
    });

    // Format the data to extract department name , and created date
    const formattedStaffData = staffData.map(staff => ({
      staffId: staff.staffId,
      userName: staff.userName,
      email: staff.email,
      addedDate: staff.createdAt,
      staffStatus: staff.staffStatus,
      role: staff.role,
      departmentName: staff.department ? staff.department.name : null,
      permission: staff.permission
    }));

    // Calculate pagination details
    const totalPages = Math.ceil(totalStaff / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // paginated response
    const response = {

      currentPage: page,
      totalPages,
      limit,
      totalStaff,
      hasNextPage,
      hasPrevPage,
      staff: formattedStaffData,
      nextPage: hasNextPage ? `/api/v1/all-staff?page=${page + 1}&limit=${limit}` : null,
      prevPage: hasPrevPage ? `/api/v1/all-staff?page=${page - 1}&limit=${limit}` : null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching paginated staff data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};