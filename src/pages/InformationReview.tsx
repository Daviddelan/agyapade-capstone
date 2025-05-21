import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { SignupProgress } from '../components/signup/SignupProgress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { getUserData, updateUserInformation } from '../lib/firebase';

const titles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];

export default function InformationReview() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) return;
        const data = await getUserData(userId);
        setUserData(data);
        setEditedData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!userId) throw new Error('User ID is required');
      
      await updateUserInformation(userId, editedData);
      setUserData(editedData);
      setIsEditing(false);
      setSuccess('Information updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(`/signup/verify/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden-500" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load user information</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review Your Information
          </h1>
          <p className="text-gray-600">
            Please review your information carefully before proceeding
          </p>
        </div>

        <SignupProgress currentStep={4} totalSteps={5} />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="text-golden-600 hover:text-golden-700 font-medium"
              >
                Edit Information
              </button>
            ) : (
              <div className="space-x-4">
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-golden-600 hover:text-golden-700 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Title</Label>
              {isEditing ? (
                <Select
                  id="title"
                  value={editedData.title}
                  onChange={e => setEditedData({ ...editedData, title: e.target.value })}
                  className="mt-1"
                >
                  <option value="">Select Title</option>
                  {titles.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </Select>
              ) : (
                <p className="mt-1 text-gray-900">{userData.title || 'Not specified'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="surname">Surname</Label>
              {isEditing ? (
                <Input
                  id="surname"
                  value={editedData.surname}
                  onChange={e => setEditedData({ ...editedData, surname: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{userData.surname}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={editedData.firstName}
                  onChange={e => setEditedData({ ...editedData, firstName: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{userData.firstName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              {isEditing ? (
                <Input
                  id="middleName"
                  value={editedData.middleName}
                  onChange={e => setEditedData({ ...editedData, middleName: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{userData.middleName || 'Not specified'}</p>
              )}
            </div>

            <div>
              <Label>Gender</Label>
              {isEditing ? (
                <div className="mt-1 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={editedData.gender === 'male'}
                      onChange={e => setEditedData({ ...editedData, gender: e.target.value })}
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={editedData.gender === 'female'}
                      onChange={e => setEditedData({ ...editedData, gender: e.target.value })}
                      className="mr-2"
                    />
                    Female
                  </label>
                </div>
              ) : (
                <p className="mt-1 text-gray-900 capitalize">{userData.gender}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              {isEditing ? (
                <Input
                  id="nationality"
                  value={editedData.nationality}
                  onChange={e => setEditedData({ ...editedData, nationality: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{userData.nationality}</p>
              )}
            </div>

            {/* Contact Information (Read-only) */}
            <div>
              <Label>Email Address</Label>
              <p className="mt-1 text-gray-900">{userData.email}</p>
              <p className="text-sm text-gray-500">Cannot be modified</p>
            </div>

            <div>
              <Label>Phone Number</Label>
              <p className="mt-1 text-gray-900">{userData.primaryPhone}</p>
              <p className="text-sm text-gray-500">Cannot be modified</p>
            </div>

            {/* Residential Address */}
            <div className="col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Residential Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.residentialAddress.country}
                      onChange={e => setEditedData({
                        ...editedData,
                        residentialAddress: {
                          ...editedData.residentialAddress,
                          country: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.residentialAddress.country}</p>
                  )}
                </div>

                <div>
                  <Label>Region</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.residentialAddress.region}
                      onChange={e => setEditedData({
                        ...editedData,
                        residentialAddress: {
                          ...editedData.residentialAddress,
                          region: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.residentialAddress.region}</p>
                  )}
                </div>

                <div>
                  <Label>Town</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.residentialAddress.town}
                      onChange={e => setEditedData({
                        ...editedData,
                        residentialAddress: {
                          ...editedData.residentialAddress,
                          town: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.residentialAddress.town}</p>
                  )}
                </div>

                <div>
                  <Label>Street</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.residentialAddress.street}
                      onChange={e => setEditedData({
                        ...editedData,
                        residentialAddress: {
                          ...editedData.residentialAddress,
                          street: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.residentialAddress.street}</p>
                  )}
                </div>

                <div>
                  <Label>House Number</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.residentialAddress.houseNumber}
                      onChange={e => setEditedData({
                        ...editedData,
                        residentialAddress: {
                          ...editedData.residentialAddress,
                          houseNumber: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.residentialAddress.houseNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Postal Address */}
            <div className="col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Postal Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.postalAddress.country}
                      onChange={e => setEditedData({
                        ...editedData,
                        postalAddress: {
                          ...editedData.postalAddress,
                          country: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.postalAddress.country}</p>
                  )}
                </div>

                <div>
                  <Label>Region</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.postalAddress.region}
                      onChange={e => setEditedData({
                        ...editedData,
                        postalAddress: {
                          ...editedData.postalAddress,
                          region: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.postalAddress.region}</p>
                  )}
                </div>

                <div>
                  <Label>Town</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.postalAddress.town}
                      onChange={e => setEditedData({
                        ...editedData,
                        postalAddress: {
                          ...editedData.postalAddress,
                          town: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.postalAddress.town}</p>
                  )}
                </div>

                <div>
                  <Label>Box Number</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.postalAddress.boxNumber}
                      onChange={e => setEditedData({
                        ...editedData,
                        postalAddress: {
                          ...editedData.postalAddress,
                          boxNumber: e.target.value
                        }
                      })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.postalAddress.boxNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={isEditing || isLoading}
            className="px-8 py-3 bg-golden-500 text-white rounded-lg font-medium hover:bg-golden-600 
                     transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue to Verification
          </button>
        </div>
      </div>
    </div>
  );
}