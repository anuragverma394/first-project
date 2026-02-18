
export const validateRegister = ({
  name,
  email,
  phone,
  dob,
  gender,
  address,
  city,
  state,
  pincode,
  password,
  confirmPassword,
  qualifications,
  role = "student",
}) => {
  const errors = {};

  if (!name) {
    errors.name = "Name is required";
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    errors.name = "Name cannot contain numbers or special characters";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Invalid email format";
  }

  if (!phone) {
    errors.phone = "Phone number is required";
  } else if (!/^[0-9]{10}$/.test(phone)) {
    errors.phone = "Phone must be exactly 10 digits";
  }

  if (!dob) {
    errors.dob = "Date of Birth is required";
  }

  if (!gender) {
    errors.gender = "Please select gender";
  }

  if (!address) {
    errors.address = "Address is required";
  }

  if (!city) {
    errors.city = "City is required";
  }

  if (!state) {
    errors.state = "State is required";
  }

  if (!pincode) {
    errors.pincode = "Pincode is required";
  } else if (!/^[0-9]{6}$/.test(pincode)) {
    errors.pincode = "Pincode must be 6 digits";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)
  ) {
    errors.password =
      "Password must contain uppercase, lowercase, number & special character";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // ✅ Only require qualifications for students, not admins
  if (role !== "admin") {
    if (!Array.isArray(qualifications) || qualifications.length === 0) {
      errors.qualifications = "Add at least one qualification";
    } else {
      qualifications.forEach((q, index) => {
        if (!q.collegeName) errors.qualifications = `Qualification ${index + 1}: College Name required`;
        if (!q.course)      errors.qualifications = `Qualification ${index + 1}: Course required`;
        if (!q.year)        errors.qualifications = `Qualification ${index + 1}: Year required`;
        if (!q.percentage)  errors.qualifications = `Qualification ${index + 1}: Percentage required`;
      });
    }
  }

  return errors;
};