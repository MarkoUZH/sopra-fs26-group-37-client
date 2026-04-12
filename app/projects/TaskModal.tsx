"use client";
import { Avatar, Col, Form, Input, Modal, Row, Select, Tag, Typography } from "antd";
import React from "react";
import { TeamMember } from "@/projects/projectTypes";
import { Task, TaskColumn } from "@/projects/taskTypes";

export interface TaskModalProps {
  open: boolean;
  initialColumn: TaskColumn;
  editingTask?: Task | null;
  team: TeamMember[];
  onClose: () => void;
  onSave: (task: Omit<Task, "id">) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  initialColumn,
  editingTask,
  team,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue(
        editingTask
          ? {
              ...editingTask,
              tags: editingTask.tags?.join(", ") ?? "",
              assigneeIndex: team.findIndex((m) => m.name === editingTask.assignee?.name),
            }
          : { column: initialColumn, priority: "medium" }
      );
    }
  }, [open, editingTask, initialColumn, form, team]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const assignee =
        values.assigneeIndex !== undefined && values.assigneeIndex >= 0
          ? team[values.assigneeIndex]
          : undefined;
      onSave({
        ...values,
        assignee,
        tags: values.tags
          ? values.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [],
      });
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title={editingTask ? "Edit Task" : "Add Task"}
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose(); }}
      okText={editingTask ? "Save changes" : "Add task"}
      width={480}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Task title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Optional description" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="priority" label="Priority">
              <Select>
                <Select.Option value="high"><Tag color="red">High</Tag></Select.Option>
                <Select.Option value="medium"><Tag color="orange">Medium</Tag></Select.Option>
                <Select.Option value="low"><Tag color="blue">Low</Tag></Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="column" label="Column">
              <Select>
                <Select.Option value="todo">To Do</Select.Option>
                <Select.Option value="inprogress">In Progress</Select.Option>
                <Select.Option value="done">Done</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="assigneeIndex" label="Assignee">
              <Select allowClear placeholder="Unassigned">
                {team.map((member, i) => (
                  <Select.Option key={i} value={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar
                        size={18}
                        style={{ backgroundColor: member.color, fontSize: 9, fontWeight: 700 }}
                      >
                        {member.initials}
                      </Avatar>
                      {member.name}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dueDate" label="Due date">
              <Input placeholder="e.g. Apr 30" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="tags" label="Tags" extra="Comma-separated, e.g. dev, design">
          <Input placeholder="dev, design, content" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;
