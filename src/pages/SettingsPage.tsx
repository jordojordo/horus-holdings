import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Space, Form, notification } from 'antd';

import useAuth from '@/hooks/useAuth';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, deleteUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdate = async() => {
    if (!user) {
      return;
    }

    if (newPassword !== confirmPassword) {
      notification.error({ message: 'Passwords do not match' });

      return;
    }

    try {
      await updateProfile(username, newPassword);
      notification.success({ message: 'Profile updated successfully' });

      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      notification.error({ message: error.message });
    }
  };

  const handleDelete = async() => {
    try {
      if (!user) {
        return;
      }

      await deleteUser();
      notification.success({ message: 'Account deleted successfully' });

      navigate('/');
    } catch (error: any) {
      notification.error({ message: error.message });
    }
  };

  return (
    <div>
      <h2>Settings</h2>
      <Space>
        <Form layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="Username">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="New Password">
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Confirm Password">
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <button type="submit" className="btn text-bold mt-6">
              Update Profile
            </button>
          </Form.Item>
          <div className="divider" />
          <Form.Item>
            <button
              type="button"
              className="btn btn-danger text-bold"
              onClick={handleDelete}
            >
              Delete Account
            </button>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
};

export default Settings;
