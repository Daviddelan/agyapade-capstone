import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Upload, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { submitIndividualRegistration } from '../../lib/firebase';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { cn } from '../../lib/utils';

interface IndividualFormProps {
  sessionId: string;
  onSubmit: (data: FormData) => Promise<void>;
}

const titles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
const identificationTypes = ['National ID', 'Passport', 'Driver\'s License'];
const roles = ['Lender', 'Agent'];

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const emailSchema = z.string().email('Invalid email format');
const phoneSchema = z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number format');

export function IndividualForm({ sessionId, onSubmit }: IndividualFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    surname: '',
    firstName: '',
    middleName: '',
    gender: '',
    nationality: '',
    identificationType: '',
    identificationNumber: '',
    dateOfBirth: null as Date | null,
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    role: '',
    username: '',
    password: '',
    confirmPassword: '',
    residentialAddress: {
      country: '',
      region: '',
      town: '',
      street: '',
      houseNumber: '',
    },
    postalAddress: {
      country: '',
      region: '',
      town: '',
      boxNumber: '',
    },
    identificationDocument: null as File | null,
    additionalDocuments: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.surname) newErrors.surname = 'Surname is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.identificationType) newErrors.identificationType = 'Identification type is required';
    if (!formData.identificationNumber) newErrors.identificationNumber = 'Identification number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.primaryPhone) newErrors.primaryPhone = 'Primary phone is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';

    // Residential address validation
    if (!formData.residentialAddress.country) newErrors['residentialAddress.country'] = 'Country is required';
    if (!formData.residentialAddress.region) newErrors['residentialAddress.region'] = 'Region is required';
    if (!formData.residentialAddress.town) newErrors['residentialAddress.town'] = 'Town is required';
    if (!formData.residentialAddress.street) newErrors['residentialAddress.street'] = 'Street is required';
    if (!formData.residentialAddress.houseNumber) newErrors['residentialAddress.houseNumber'] = 'House number is required';

    // Postal address validation
    if (!formData.postalAddress.country) newErrors['postalAddress.country'] = 'Country is required';
    if (!formData.postalAddress.region) newErrors['postalAddress.region'] = 'Region is required';
    if (!formData.postalAddress.town) newErrors['postalAddress.town'] = 'Town is required';
    if (!formData.postalAddress.boxNumber) newErrors['postalAddress.boxNumber'] = 'Box number is required';

    // Complex validations
    try {
      emailSchema.parse(formData.email);
    } catch (error) {
      newErrors.email = 'Invalid email format';
    }

    try {
      phoneSchema.parse(formData.primaryPhone);
    } catch (error) {
      newErrors.primaryPhone = 'Invalid phone number format';
    }

    if (formData.secondaryPhone) {
      try {
        phoneSchema.parse(formData.secondaryPhone);
      } catch (error) {
        newErrors.secondaryPhone = 'Invalid phone number format';
      }
    }

    try {
      passwordSchema.parse(formData.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // File validation
    if (!formData.identificationDocument) {
      newErrors.identificationDocument = 'Identification document is required';
    } else if (formData.identificationDocument.size > 3 * 1024 * 1024) {
      newErrors.identificationDocument = 'File size must be less than 3MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await submitIndividualRegistration(formData, sessionId);
      await onSubmit(formData);
      navigate(`/signup/review/${userId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to submit registration. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'identificationDocument' | 'additionalDocuments') => {
    const files = e.target.files;
    if (!files) return;

    if (field === 'identificationDocument') {
      const file = files[0];
      if (file && file.size <= 3 * 1024 * 1024) {
        setFormData(prev => ({ ...prev, identificationDocument: file }));
        setErrors(prev => ({ ...prev, identificationDocument: undefined }));
      } else {
        setErrors(prev => ({ ...prev, identificationDocument: 'File size must be less than 3MB' }));
      }
    } else {
      const validFiles = Array.from(files).filter(file => file.size <= 3 * 1024 * 1024);
      setFormData(prev => ({ ...prev, additionalDocuments: [...prev.additionalDocuments, ...validFiles] }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Please correct the following errors:</div>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Select
              id="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={cn(errors.title && "border-red-500")}
            >
              <option value="">Select Title</option>
              {titles.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="surname">Surname*</Label>
            <Input
              id="surname"
              type="text"
              value={formData.surname}
              onChange={e => setFormData(prev => ({ ...prev, surname: e.target.value }))}
              className={cn(errors.surname && "border-red-500")}
              required
            />
            {errors.surname && (
              <span className="text-sm text-red-500">{errors.surname}</span>
            )}
          </div>

          <div>
            <Label htmlFor="firstName">First Name*</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className={cn(errors.firstName && "border-red-500")}
              required
            />
            {errors.firstName && (
              <span className="text-sm text-red-500">{errors.firstName}</span>
            )}
          </div>

          <div>
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              type="text"
              value={formData.middleName}
              onChange={e => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
            />
          </div>

          <div>
            <Label>Gender*</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="mr-2"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="mr-2"
                />
                Female
              </label>
            </div>
            {errors.gender && (
              <span className="text-sm text-red-500">{errors.gender}</span>
            )}
          </div>

          <div>
            <Label htmlFor="nationality">Nationality*</Label>
            <Input
              id="nationality"
              type="text"
              value={formData.nationality}
              onChange={e => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              className={cn(errors.nationality && "border-red-500")}
              required
            />
            {errors.nationality && (
              <span className="text-sm text-red-500">{errors.nationality}</span>
            )}
          </div>
        </div>
      </div>

      {/* Identification Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-6">Identification Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="identificationType">Identification Type*</Label>
            <Select
              id="identificationType"
              value={formData.identificationType}
              onChange={e => setFormData(prev => ({ ...prev, identificationType: e.target.value }))}
              className={cn(errors.identificationType && "border-red-500")}
              required
            >
              <option value="">Select ID Type</option>
              {identificationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            {errors.identificationType && (
              <span className="text-sm text-red-500">{errors.identificationType}</span>
            )}
          </div>

          <div>
            <Label htmlFor="identificationNumber">Identification Number*</Label>
            <Input
              id="identificationNumber"
              type="text"
              value={formData.identificationNumber}
              onChange={e => setFormData(prev => ({ ...prev, identificationNumber: e.target.value }))}
              className={cn(errors.identificationNumber && "border-red-500")}
              required
            />
            {errors.identificationNumber && (
              <span className="text-sm text-red-500">{errors.identificationNumber}</span>
            )}
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth*</Label>
            <DatePicker
              selected={formData.dateOfBirth}
              onChange={(date: Date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              placeholderText="Select date"
              className={cn(
                "w-full rounded-md border p-2",
                errors.dateOfBirth ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.dateOfBirth && (
              <span className="text-sm text-red-500">{errors.dateOfBirth}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="primaryPhone">Primary Phone*</Label>
            <Input
              id="primaryPhone"
              type="tel"
              value={formData.primaryPhone}
              onChange={e => setFormData(prev => ({ ...prev, primaryPhone: e.target.value }))}
              className={cn(errors.primaryPhone && "border-red-500")}
              placeholder="+1234567890"
              required
            />
            {errors.primaryPhone && (
              <span className="text-sm text-red-500">{errors.primaryPhone}</span>
            )}
          </div>

          <div>
            <Label htmlFor="secondaryPhone">Secondary Phone</Label>
            <Input
              id="secondaryPhone"
              type="tel"
              value={formData.secondaryPhone}
              onChange={e => setFormData(prev => ({ ...prev, secondaryPhone: e.target.value }))}
              className={cn(errors.secondaryPhone && "border-red-500")}
              placeholder="+1234567890"
            />
            {errors.secondaryPhone && (
              <span className="text-sm text-red-500">{errors.secondaryPhone}</span>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address*</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={cn(errors.email && "border-red-500")}
              required
            />
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-6">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="role">Major Role*</Label>
            <Select
              id="role"
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className={cn(errors.role && "border-red-500")}
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role} value={role.toLowerCase()}>{role}</option>
              ))}
            </Select>
            {errors.role && (
              <span className="text-sm text-red-500">{errors.role}</span>
            )}
          </div>

          <div>
            <Label htmlFor="username">Username*</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className={cn(errors.username && "border-red-500")}
              required
            />
            {errors.username && (
              <span className="text-sm text-red-500">{errors.username}</span>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="password">Password*</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={cn(errors.password && "border-red-500")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password}</span>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="confirmPassword">Confirm Password*</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={cn(errors.confirmPassword && "border-red-500")}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-sm text-red-500">{errors.confirmPassword}</span>
            )}
          </div>
        </div>
      </div>

      {/* Residential Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-6">Residential Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="residentialCountry">Country*</Label>
            <Input
              id="residentialCountry"
              type="text"
              value={formData.residentialAddress.country}
              onChange={e => setFormData(prev => ({
                ...prev,
                residentialAddress: { ...prev.residentialAddress, country: e.target.value }
              }))}
              className={cn(errors['residentialAddress.country'] && "border-red-500")}
              required
            />
            {errors['residentialAddress.country'] && (
              <span className="text-sm text-red-500">{errors['residentialAddress.country']}</span>
            )}
          </div>

          <div>
            <Label htmlFor="residentialRegion">Region*</Label>
            <Input
              id="residentialRegion"
              type="text"
              value={formData.residentialAddress.region}
              onChange={e => setFormData(prev => ({
                ...prev,
                residentialAddress: { ...prev.residentialAddress, region: e.target.value }
              }))}
              className={cn(errors['residentialAddress.region'] && "border-red-500")}
              required
            />
            {errors['residentialAddress.region'] && (
              <span className="text-sm text-red-500">{errors['residentialAddress.region']}</span>
            )}
          </div>

          <div>
            <Label htmlFor="residentialTown">Town*</Label>
            <Input
              id="residentialTown"
              type="text"
              value={formData.residentialAddress.town}
              onChange={e => setFormData(prev => ({
                ...prev,
                residentialAddress: { ...prev.residentialAddress, town: e.target.value }
              }))}
              className={cn(errors['residentialAddress.town'] && "border-red-500")}
              required
            />
            {errors['residentialAddress.town'] && (
              <span className="text-sm text-red-500">{errors['residentialAddress.town']}</span>
            )}
          </div>

          <div>
            <Label htmlFor="residentialStreet">Street*</Label>
            <Input
              id="residentialStreet"
              type="text"
              value={formData.residentialAddress.street}
              onChange={e => setFormData(prev => ({
                ...prev,
                residentialAddress: { ...prev.residentialAddress, street: e.target.value }
              }))}
              className={cn(errors['residentialAddress.street'] && "border-red-500")}
              required
            />
            {errors['residentialAddress.street'] && (
              <span className="text-sm text-red-500">{errors['residentialAddress.street']}</span>
            )}
          </div>

          <div>
            <Label htmlFor="residentialHouseNumber">House Number*</Label>
            <Input
              id="residentialHouseNumber"
              type="text"
              value={formData.residentialAddress.houseNumber}
              onChange={e => setFormData(prev => ({
                ...prev,
                residentialAddress: { ...prev.residentialAddress, houseNumber: e.target.value }
              }))}
              className={cn(errors['residentialAddress.houseNumber'] && "border-red-500")}
              required
            />
            {errors['residentialAddress.houseNumber'] && (
              <span className="text-sm text-red-500">{errors['residentialAddress.houseNumber']}</span>
            )}
          </div>
        </div>
      </div>

      {/* Postal Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-6">Postal Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="postalCountry">Country*</Label>
            <Input
              id="postalCountry"
              type="text"
              value={formData.postalAddress.country}
              onChange={e => setFormData(prev => ({
                ...prev,
                postalAddress: { ...prev.postalAddress, country: e.target.value }
              }))}
              className={cn(errors['postalAddress.country'] && "border-red-500")}
              required
            />
            {errors['postalAddress.country'] && (
              <span className="text-sm text-red-500">{errors['postalAddress.country']}</span>
            )}
          </div>

          <div>
            <Label htmlFor="postalRegion">Region*</Label>
            <Input
              id="postalRegion"
              type="text"
              value={formData.postalAddress.region}
              onChange={e => setFormData(prev => ({
                ...prev,
                postalAddress: { ...prev.postalAddress, region: e.target.value }
              }))}
              className={cn(errors['postalAddress.region'] && "border-red-500")}
              required
            />
            {errors['postalAddress.region'] && (
              <span className="text-sm text-red-500">{errors['postalAddress.region']}</span>
            )}
          </div>

          <div>
            <Label htmlFor="postalTown">Town*</Label>
            <Input
              id="postalTown"
              type="text"
              value={formData.postalAddress.town}
              onChange={e => setFormData(prev => ({
                ...prev,
                postalAddress: { ...prev.postalAddress, town: e.target.value }
              }))}
              className={cn(errors['postalAddress.town'] && "border-red-500")}
              required
            />
            {errors['postalAddress.town'] && (
              <span className="text-sm text-red-500">{errors['postalAddress.town']}</span>
            )}
          </div>

          <div>
            <Label htmlFor="postalBoxNumber">Box Number*</Label>
            <Input
              id="postalBoxNumber"
              type="text"
              value={formData.postalAddress.boxNumber}
              onChange={e => setFormData(prev => ({
                ...prev,
                postalAddress: { ...prev.postalAddress, boxNumber: e.target.value }
              }))}
              className={cn(errors['postalAddress.boxNumber'] && "border-red-500")}
              required
            />
            {errors['postalAddress.boxNumber'] && (
              <span className="text-sm text-red-500">{errors['postalAddress.boxNumber']}</span>
            )}
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-6">Document Upload</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="idDocument">Proof of ID*</Label>
            <input
              type="file"
              id="idDocument"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => handleFileChange(e, 'identificationDocument')}
              className="hidden"
            />
            <label
              htmlFor="idDocument"
              className={cn(
                "flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer",
                "hover:border-primary hover:bg-primary/5 transition-colors",
                errors.identificationDocument && "border-red-500"
              )}
            >
              <Upload className="h-5 w-5" />
              <span>{formData.identificationDocument ? 'Change ID Document' : 'Upload ID Document'}</span>
            </label>
            {formData.identificationDocument && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {formData.identificationDocument.name}
              </p>
            )}
            {errors.identificationDocument && (
              <span className="text-sm text-red-500">{errors.identificationDocument}</span>
            )}
          </div>

          <div>
            <Label htmlFor="additionalDocs">Additional Documents (Optional)</Label>
            <input
              type="file"
              id="additionalDocs"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={e => handleFileChange(e, 'additionalDocuments')}
              className="hidden"
            />
            <label
              htmlFor="additionalDocs"
              className={cn(
                "flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer",
                "hover:border-primary hover:bg-primary/5 transition-colors"
              )}
            >
              <Upload className="h-5 w-5" />
              <span>Upload Additional Documents</span>
            </label>
            {formData.additionalDocuments.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected files:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {formData.additionalDocuments.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full py-3 px-4 bg-[#f7b732] text-white rounded-lg font-medium",
          "flex items-center justify-center gap-2",
          "transition-all duration-200",
          "disabled:opacity-70 disabled:cursor-not-allowed",
          "hover:bg-[#e69a0b]"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          'Continue to Verification'
        )}
      </button>
    </form>
  );
}