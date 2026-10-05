import { useEffect, useState } from "react";

import { apiRequest } from "../Services/api";

import "./Profile.css";

function Profile() {

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        mobile: "",
        gender: "",
        dob: "",
        address: ""
    });

    const [originalProfile, setOriginalProfile] = useState({
        name: "",
        email: "",
        mobile: "",
        gender: "",
        dob: "",
        address: ""
    });

    // Global editing mode
    const [isEditing, setIsEditing] = useState(false);

    // Which protected field has been authenticated
    const [authenticatedFields, setAuthenticatedFields] = useState({
        email: false,
        mobile: false
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Authentication modal
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingSensitiveField, setPendingSensitiveField] =
        useState(null);
    const [currentPassword, setCurrentPassword] = useState("");

    /*
     * Load logged-in user's profile
     */
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await apiRequest(
                "/api/users/me"
            );

            const loadedProfile = {
                name: data.name || "",
                email: data.email || "",
                mobile: data.mobile || "",
                gender: data.gender || "",
                dob: data.dob || "",
                address: data.address || ""
            };

            setProfile(loadedProfile);
            setOriginalProfile(loadedProfile);

        } catch (err) {

            console.error(
                "Failed to load profile:",
                err
            );

            setError(
                err.message ||
                "Failed to load profile."
            );

        } finally {

            setLoading(false);
        }
    };

    /*
     * Check whether profile has changes
     */
    const hasChanges =
        JSON.stringify(profile) !==
        JSON.stringify(originalProfile);

    /*
     * Enter global edit mode
     */
    const handleEditProfile = () => {

        setIsEditing(true);

        setError("");
        setSuccess("");
    };

    /*
     * Handle field changes
     */
    const handleFieldChange = (
        field,
        value
    ) => {

        setProfile((previous) => ({
            ...previous,
            [field]: value
        }));

        setError("");
        setSuccess("");
    };

    /*
     * Open authentication modal for
     * email or mobile.
     */
    const handleProtectedFieldClick = (
        field
    ) => {

        if (!isEditing) {
            return;
        }

        /*
         * If this field has already been
         * authenticated during this editing
         * session, don't show the modal again.
         */
        if (authenticatedFields[field]) {
            return;
        }

        setPendingSensitiveField(field);
        setCurrentPassword("");
        setShowAuthModal(true);

        setError("");
    };

    /*
     * Authenticate protected field
     */
    const handleSensitiveAuthentication = async () => {

        if (!currentPassword.trim()) {

            setError(
                "Please enter your current password."
            );

            return;
        }

        /*
         * We don't need a separate backend
         * verification endpoint.
         *
         * The password will be verified by
         * the existing PUT /api/users/me endpoint
         * when Save Changes is clicked.
         *
         * Here we simply unlock the selected field.
         */
        setAuthenticatedFields((previous) => ({
            ...previous,
            [pendingSensitiveField]: true
        }));

        setShowAuthModal(false);

        setError("");
    };

    /*
     * Cancel authentication
     */
    const cancelAuthentication = () => {

        setShowAuthModal(false);

        setPendingSensitiveField(null);

        setCurrentPassword("");

        setError("");
    };

    /*
     * Save profile
     */
    const handleSave = async () => {

        if (!hasChanges) {
            return;
        }

        try {

            setSaving(true);

            setError("");
            setSuccess("");

            const emailChanged =
                profile.email !== originalProfile.email;

            const mobileChanged =
                profile.mobile !== originalProfile.mobile;

            /*
             * Make sure sensitive fields can only
             * be changed after authentication.
             */
            if (
                emailChanged &&
                !authenticatedFields.email
            ) {

                setError(
                    "Please authenticate before changing your email address."
                );

                setSaving(false);

                return;
            }

            if (
                mobileChanged &&
                !authenticatedFields.mobile
            ) {

                setError(
                    "Please authenticate before changing your mobile number."
                );

                setSaving(false);

                return;
            }

            /*
             * Build complete request.
             *
             * Email/mobile are now included from
             * the edited profile, rather than the
             * original profile.
             */
            const requestBody = {
                name: profile.name,
                gender: profile.gender,
                dob: profile.dob,
                address: profile.address,
                email: profile.email,
                mobile: profile.mobile
            };

            /*
             * Backend requires current password
             * when email or mobile changes.
             */
            if (
                emailChanged ||
                mobileChanged
            ) {

                if (!currentPassword.trim()) {

                    setError(
                        "Authentication is required to change your email or mobile number."
                    );

                    setSaving(false);

                    return;
                }

                requestBody.currentPassword =
                    currentPassword;
            }

            const updatedUser =
                await apiRequest(
                    "/api/users/me",
                    {
                        method: "PUT",
                        body: JSON.stringify(
                            requestBody
                        )
                    }
                );

            const updatedProfile = {
                name: updatedUser.name || "",
                email: updatedUser.email || "",
                mobile: updatedUser.mobile || "",
                gender: updatedUser.gender || "",
                dob: updatedUser.dob || "",
                address: updatedUser.address || ""
            };

            setProfile(updatedProfile);
            setOriginalProfile(updatedProfile);

            setIsEditing(false);

            setAuthenticatedFields({
                email: false,
                mobile: false
            });

            setCurrentPassword("");

            setPendingSensitiveField(null);

            setSuccess(
                "Your profile has been updated successfully."
            );

        } catch (err) {

            console.error(
                "Failed to update profile:",
                err
            );

            setError(
                err.message ||
                "Failed to update your profile."
            );

        } finally {

            setSaving(false);
        }
    };

    /*
     * Cancel all profile changes
     */
    const handleCancelChanges = () => {

        setProfile(originalProfile);

        setIsEditing(false);

        setAuthenticatedFields({
            email: false,
            mobile: false
        });

        setCurrentPassword("");

        setPendingSensitiveField(null);

        setError("");
        setSuccess("");
    };

    /*
     * Field labels
     */
    const getFieldLabel = (field) => {

        const labels = {
            name: "Full Name",
            email: "Email Address",
            mobile: "Mobile Number",
            gender: "Gender",
            dob: "Date of Birth",
            address: "Address"
        };

        return labels[field];
    };

    /*
     * Render profile field
     */
    const renderField = (
        field,
        type = "text"
    ) => {

        const isProtected =
            field === "email" ||
            field === "mobile";

        const isAuthenticated =
            authenticatedFields[field];

        const fieldIsEditable =
            isEditing &&
            (
                !isProtected ||
                isAuthenticated
            );

        return (
            <div className="profile-field">

                <div className="profile-field-header">

                    <label>
                        {getFieldLabel(field)}
                    </label>

                </div>

                <div className="profile-input-wrapper">

                    {field === "gender" &&
                    fieldIsEditable ? (

                        <select
                            value={profile[field]}
                            onChange={(event) =>
                                handleFieldChange(
                                    field,
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Select Gender
                            </option>

                            <option value="Male">
                                Male
                            </option>

                            <option value="Female">
                                Female
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>

                    ) : (

                        <input
                            type={type}
                            value={profile[field]}
                            readOnly={!fieldIsEditable}
                            onChange={(event) =>
                                handleFieldChange(
                                    field,
                                    event.target.value
                                )
                            }
                        />

                    )}

                </div>

                {isProtected && (

                    <button
                        type="button"
                        className={
                            "field-security-note " +
                            (
                                isAuthenticated
                                    ? "authenticated"
                                    : ""
                            )
                        }
                        onClick={() =>
                            handleProtectedFieldClick(
                                field
                            )
                        }
                        disabled={
                            !isEditing ||
                            isAuthenticated
                        }
                    >

                        {isAuthenticated
                            ? "✓ Authentication verified"
                            : "🔒 Authentication required to change"}

                    </button>

                )}

            </div>
        );
    };

    /*
     * Loading state
     */
    if (loading) {

        return (
            <div className="profile-page">

                <div className="profile-loading">
                    Loading your profile...
                </div>

            </div>
        );
    }

    return (
        <div className="profile-page">

            <div className="profile-container">

                <div className="profile-heading">

                    <div>

                        <h1>
                            My Profile
                        </h1>

                        <p>
                            View and manage your personal information.
                        </p>

                    </div>

                </div>

                {error && (

                    <div className="profile-message error">
                        {error}
                    </div>

                )}

                {success && (

                    <div className="profile-message success">
                        {success}
                    </div>

                )}

                <div className="profile-card">

                    {/* Profile Header */}

                    <div className="profile-card-header">

                        <div className="profile-avatar">

                            {profile.name
                                ? profile.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}

                        </div>

                        <div className="profile-user-info">

                            <h2>
                                {profile.name || "User"}
                            </h2>

                            <span>
                                Account Information
                            </span>

                        </div>

                        {!isEditing && (

                            <button
                                type="button"
                                className="edit-profile-button"
                                onClick={
                                    handleEditProfile
                                }
                            >
                                Edit Profile
                            </button>

                        )}

                    </div>

                    <div className="profile-divider"></div>

                    {/* Profile Fields */}

                    <div className="profile-grid">

                        {renderField("name")}

                        {renderField("gender")}

                        {renderField(
                            "dob",
                            "date"
                        )}

                        {renderField("mobile")}

                        {renderField(
                            "email",
                            "email"
                        )}

                        {renderField("address")}

                    </div>

                    <div className="profile-divider"></div>

                    {/* Bottom Actions */}

                    <div className="profile-actions">

                        <button
                            type="button"
                            className="cancel-changes-button"
                            disabled={
                                !isEditing ||
                                saving
                            }
                            onClick={
                                handleCancelChanges
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="save-changes-button"
                            disabled={
                                !isEditing ||
                                !hasChanges ||
                                saving
                            }
                            onClick={handleSave}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Changes"}

                        </button>

                    </div>

                </div>

            </div>

            {/* Authentication Modal */}

            {showAuthModal && (

                <div className="profile-modal-overlay">

                    <div className="profile-auth-modal">

                        <button
                            type="button"
                            className="modal-close"
                            onClick={
                                cancelAuthentication
                            }
                        >
                            ×
                        </button>

                        <h2>
                            Authentication Required
                        </h2>

                        <p>
                            Enter your current password
                            to change your{" "}
                            {
                                pendingSensitiveField ===
                                "email"
                                    ? "email address"
                                    : "mobile number"
                            }.
                        </p>

                        <input
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(event) =>
                                setCurrentPassword(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {

                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    handleSensitiveAuthentication();
                                }

                            }}
                            autoFocus
                        />

                        <div className="auth-modal-actions">

                            <button
                                type="button"
                                className="modal-cancel-button"
                                onClick={
                                    cancelAuthentication
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modal-confirm-button"
                                onClick={
                                    handleSensitiveAuthentication
                                }
                            >
                                Continue
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Profile;