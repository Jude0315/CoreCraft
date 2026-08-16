
const GenerateFrontendFiles = (specification) => {
  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const pages = Array.isArray(specification.pages)
    ? specification.pages
    : [];

  const appType =
    specification.appType ||
    "Application";

  const pageFiles = pages.map((page) => {
    const componentName =
      NormalizeComponentName(page);

    return {
      type: "page",
      page,
      filename: `${componentName}.jsx`,
      componentName,
      content: GeneratePageComponent(
        componentName,
        page,
        appType
      ),
    };
  });

  return {
    pageFiles,
  };
};

const NormalizeComponentName = (pageName) => {
  return pageName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join("");
};

const GeneratePageComponent = (
  componentName,
  displayName,
  appType
) => {
  const normalized =
    appType.toLowerCase();

  if (normalized === "lms") {
    return GenerateLmsPage(
      componentName,
      displayName
    );

    
  }



  return GenerateGenericPage(
    componentName,
    displayName,
    appType
  );
};

const GenerateLmsPage = (
  componentName,
  displayName
) => {
  if (componentName === "HomePage") {
    return `import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">
            Learn smarter
          </span>

          <h1>
            Build skills. Track progress.
            Reach your goals.
          </h1>

          <p>
            Access courses, quizzes,
            assignments and progress tracking
            in one learning workspace.
          </p>

          <div className="hero-actions">
            <Link
              className="primary-button hero-button"
              to="/courses"
            >
              Explore Courses
            </Link>

            <Link
              className="secondary-button"
              to="/dashboard"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-header">
            <span>Learning Overview</span>
            <strong>72%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: "72%" }}
            />
          </div>

          <div className="hero-stat-grid">
            <div>
              <strong>6</strong>
              <span>Courses</span>
            </div>

            <div>
              <strong>14</strong>
              <span>Lessons</span>
            </div>

            <div>
              <strong>4</strong>
              <span>Assignments</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span className="eyebrow">
            Platform features
          </span>

          <h2>
            Everything needed for focused learning
          </h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>Courses</h3>
            <p>
              Browse learning content and
              continue lessons from one place.
            </p>
          </article>

          <article className="feature-card">
            <h3>Assignments</h3>
            <p>
              Manage upcoming tasks and
              track completed work.
            </p>
          </article>

          <article className="feature-card">
            <h3>Quizzes</h3>
            <p>
              Test understanding and improve
              knowledge through assessments.
            </p>
          </article>

          <article className="feature-card">
            <h3>Progress</h3>
            <p>
              Monitor course completion and
              learning performance.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
`;
  }

if (componentName === "Dashboard") {
  return `import React, {
  useEffect,
  useState,
} from "react";

import {
  ProgressApi,
} from "../Services/Api";

import { useAuth } from "../Context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const [progressRecords, setProgressRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const LoadProgress = async () => {
      try {
        const userId =
          user?.id || user?._id;

        if (!userId) {
          setProgressRecords([]);
          setLoading(false);
          return;
        }

        const response =
          await ProgressApi.getMine();

        const records =
          response.data.data || [];

        const ownRecords =
          records.filter((record) => {
            const studentId =
              record.student?._id ||
              record.student;

            return (
              String(studentId) ===
              String(userId)
            );
          });

        setProgressRecords(
          ownRecords
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load progress"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      LoadProgress();
    }
  }, [user]);

  const averageProgress =
    progressRecords.length > 0
      ? Math.round(
          progressRecords.reduce(
            (total, record) =>
              total +
              Number(
                record.progressPercentage ||
                0
              ),
            0
          ) /
            progressRecords.length
        )
      : 0;

  const completedCourses =
    progressRecords.filter(
      (record) =>
        Number(
          record.progressPercentage
        ) >= 100
    ).length;

  const inProgressCourses =
    progressRecords.filter(
      (record) =>
        Number(
          record.progressPercentage
        ) > 0 &&
        Number(
          record.progressPercentage
        ) < 100
    ).length;

  const GetCourseName = (course) => {
    return (
      course?.title ||
      course?._id ||
      course ||
      "Course unavailable"
    );
  };

  return (
    <main className="page-shell">
      <section className="dashboard-header">
        <div>
          <span className="eyebrow">
            Dashboard
          </span>

          <h1>
            Welcome back,
            {" "}
            {user?.name || "Learner"}
          </h1>

          <p>
            Continue learning and stay
            on top of your progress.
          </p>
        </div>
      </section>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Courses Tracked</span>
          <strong>
            {loading
              ? "..."
              : progressRecords.length}
          </strong>
        </article>

        <article className="stat-card">
          <span>Completed Courses</span>
          <strong>
            {loading
              ? "..."
              : completedCourses}
          </strong>
        </article>

        <article className="stat-card">
          <span>Average Progress</span>
          <strong>
            {loading
              ? "..."
              : \`\${averageProgress}%\`}
          </strong>
        </article>

        <article className="stat-card">
          <span>In Progress</span>
          <strong>
            {loading
              ? "..."
              : inProgressCourses}
          </strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="content-card">
          <div className="card-heading">
            <h2>Continue Learning</h2>
          </div>

          {loading ? (
            <p>
              Loading progress...
            </p>
          ) : progressRecords.length === 0 ? (
            <p>
              No progress records have
              been added for your account yet.
            </p>
          ) : (
            <div className="course-list">
              {progressRecords.map(
                (record) => (
                  <div
                    className="course-row"
                    key={record._id}
                  >
                    <div>
                      <strong>
                        {GetCourseName(
                          record.course
                        )}
                      </strong>

                      <span>
                        Course progress
                      </span>
                    </div>

                    <strong>
                      {
                        record.progressPercentage
                      }%
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </article>

        <article className="content-card">
          <div className="card-heading">
            <h2>Upcoming</h2>
          </div>

          <div className="activity-list">
            <div>
              <strong>
                JavaScript Quiz
              </strong>

              <span>
                Due tomorrow
              </span>
            </div>

            <div>
              <strong>
                React Assignment
              </strong>

              <span>
                Due in 3 days
              </span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Dashboard;
`;
  }

 if (componentName === "CoursesPage") {
  return `import React, {
  useEffect,
  useState,
} from "react";

import {
  CourseApi,
} from "../Services/Api";

const CoursesPage = () => {
  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const LoadCourses = async () => {
      try {
        const response =
          await CourseApi.getAll();

        setCourses(
          response.data.data || []
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load courses"
        );
      } finally {
        setLoading(false);
      }
    };

    LoadCourses();
  }, []);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-card">
          Loading courses...
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          Courses
        </span>

        <h1>
          Continue your learning journey
        </h1>

        <p>
          Browse available courses and
          continue learning.
        </p>
      </section>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <section className="content-card">
          <h2>No courses yet</h2>

          <p>
            Courses created by instructors
            will appear here.
          </p>
        </section>
      ) : (
        <section className="course-grid">
          {courses.map((course) => (
            <article
              key={course._id}
              className="course-card"
            >
              <div className="course-card-top">
                <span className="course-category">
                  Course
                </span>

                <span className="course-progress-value">
                  {course.published
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              <h3>
                {course.title}
              </h3>

              <p className="course-instructor">
                {course.description ||
                  "No description available."}
              </p>

              <div className="course-card-footer">
                <span>
                  {course.lessons?.length || 0}
                  {" "}
                  lessons
                </span>

                <a
                  className="secondary-button"
                  href={\`/course-details?id=\${course._id}\`}
                >
                  View Course
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default CoursesPage;
`;
}

if (componentName === "InstructorPortal") {
  return `import React, {
  useEffect,
  useState,
} from "react";

import {
  CourseApi,
  LessonApi,
  QuizApi,
  AssignmentApi,
  ProgressApi,
} from "../Services/Api";

import {
  useAuth,
} from "../Context/AuthContext";

const InstructorPortal = () => {
  const { user } = useAuth();

  const [courses, setCourses] =
    useState([]);

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      published: false,
    });

  const [editingCourseId, setEditingCourseId] =
    useState(null);

  const [lessons, setLessons] =
    useState([]);

  const [lessonForm, setLessonForm] =
    useState({
      course: "",
      title: "",
      content: "",
      videoUrl: "",
      order: 0,
    });

  const [editingLessonId, setEditingLessonId] =
    useState(null);

  const [quizzes, setQuizzes] =
    useState([]);

  const [quizForm, setQuizForm] =
    useState({
      course: "",
      title: "",
      passingScore: 50,
    });

  const [editingQuizId, setEditingQuizId] =
    useState(null);

  const [assignments, setAssignments] =
    useState([]);

  const [assignmentForm, setAssignmentForm] =
    useState({
      course: "",
      title: "",
      description: "",
      dueDate: "",
      maximumMarks: 100,
    });

  const [
    editingAssignmentId,
    setEditingAssignmentId,
  ] = useState(null);

  const [progressRecords, setProgressRecords] =
    useState([]);

  const [progressForm, setProgressForm] =
    useState({
      student: "",
      course: "",
      progressPercentage: 0,
    });

  const [
    editingProgressId,
    setEditingProgressId,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const LoadCourses = async () => {
    try {
      const response =
        await CourseApi.getAll();

      setCourses(
        response.data.data || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  const LoadLessons = async () => {
    try {
      const response =
        await LessonApi.getAll();

      setLessons(
        response.data.data || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load lessons"
      );
    }
  };

  const LoadQuizzes = async () => {
    try {
      const response =
        await QuizApi.getAll();

      setQuizzes(
        response.data.data || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load quizzes"
      );
    }
  };

  const LoadAssignments = async () => {
    try {
      const response =
        await AssignmentApi.getAll();

      setAssignments(
        response.data.data || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load assignments"
      );
    }
  };

  const LoadProgress = async () => {
    try {
      const response =
        await ProgressApi.getAll();

      setProgressRecords(
        response.data.data || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load progress records"
      );
    }
  };

  useEffect(() => {
    LoadCourses();
    LoadLessons();
    LoadQuizzes();
    LoadAssignments();
    LoadProgress();
  }, []);

  const HandleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const ResetForm = () => {
    setForm({
      title: "",
      description: "",
      published: false,
    });

    setEditingCourseId(null);
  };

  const HandleLessonChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setLessonForm({
      ...lessonForm,
      [name]: value,
    });
  };

  const HandleQuizChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setQuizForm({
      ...quizForm,
      [name]: value,
    });
  };

  const HandleAssignmentChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setAssignmentForm({
      ...assignmentForm,
      [name]: value,
    });
  };

  const HandleProgressChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setProgressForm({
      ...progressForm,
      [name]: value,
    });
  };

  const HandleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        published: form.published,
        instructor: user.id || user._id,
      };

      if (editingCourseId) {
        await CourseApi.update(
          editingCourseId,
          payload
        );

        setSuccess(
          "Course updated successfully"
        );
      } else {
        await CourseApi.create(
          payload
        );

        setSuccess(
          "Course created successfully"
        );
      }

      ResetForm();

      await LoadCourses();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to save course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const HandleEdit = (course) => {
    setEditingCourseId(
      course._id
    );

    setForm({
      title:
        course.title || "",
      description:
        course.description || "",
      published:
        Boolean(course.published),
    });

    setSuccess("");
    setError("");
  };

  const HandleTogglePublish =
    async (course) => {
      try {
        setError("");
        setSuccess("");

        await CourseApi.update(
          course._id,
          {
            published:
              !course.published,
          }
        );

        setSuccess(
          course.published
            ? "Course unpublished successfully"
            : "Course published successfully"
        );

        await LoadCourses();
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to update course status"
        );
      }
    };

  const HandleLessonSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const payload = {
        course: lessonForm.course,
        title: lessonForm.title,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl,
        order: Number(
          lessonForm.order
        ),
      };

      if (editingLessonId) {
        await LessonApi.update(
          editingLessonId,
          payload
        );

        setSuccess(
          "Lesson updated successfully"
        );
      } else {
        await LessonApi.create(
          payload
        );

        setSuccess(
          "Lesson created successfully"
        );
      }

      setLessonForm({
        course: "",
        title: "",
        content: "",
        videoUrl: "",
        order: 0,
      });

      setEditingLessonId(null);

      await LoadLessons();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to save lesson"
      );
    }
  };

  const HandleLessonEdit = (lesson) => {
    setEditingLessonId(
      lesson._id
    );

    setLessonForm({
      course:
        lesson.course?._id ||
        lesson.course ||
        "",
      title:
        lesson.title || "",
      content:
        lesson.content || "",
      videoUrl:
        lesson.videoUrl || "",
      order:
        lesson.order || 0,
    });

    setSuccess("");
    setError("");
  };

  const HandleLessonDelete = async (
    lessonId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this lesson?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await LessonApi.remove(
        lessonId
      );

      setSuccess(
        "Lesson deleted successfully"
      );

      await LoadLessons();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to delete lesson"
      );
    }
  };

  const HandleQuizSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const payload = {
        course: quizForm.course,
        title: quizForm.title,
        passingScore: Number(
          quizForm.passingScore
        ),
        questions: [],
      };

      if (editingQuizId) {
        await QuizApi.update(
          editingQuizId,
          payload
        );

        setSuccess(
          "Quiz updated successfully"
        );
      } else {
        await QuizApi.create(
          payload
        );

        setSuccess(
          "Quiz created successfully"
        );
      }

      setQuizForm({
        course: "",
        title: "",
        passingScore: 50,
      });

      setEditingQuizId(null);

      await LoadQuizzes();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to save quiz"
      );
    }
  };

  const HandleQuizEdit = (quiz) => {
    setEditingQuizId(
      quiz._id
    );

    setQuizForm({
      course:
        quiz.course?._id ||
        quiz.course ||
        "",
      title:
        quiz.title || "",
      passingScore:
        quiz.passingScore || 50,
    });

    setSuccess("");
    setError("");
  };

  const HandleQuizDelete = async (
    quizId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this quiz?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await QuizApi.remove(
        quizId
      );

      setSuccess(
        "Quiz deleted successfully"
      );

      await LoadQuizzes();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to delete quiz"
      );
    }
  };

  const HandleAssignmentSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const payload = {
        course:
          assignmentForm.course,
        title:
          assignmentForm.title,
        description:
          assignmentForm.description,
        dueDate:
          assignmentForm.dueDate ||
          undefined,
        maximumMarks:
          Number(
            assignmentForm.maximumMarks
          ),
      };

      if (editingAssignmentId) {
        await AssignmentApi.update(
          editingAssignmentId,
          payload
        );

        setSuccess(
          "Assignment updated successfully"
        );
      } else {
        await AssignmentApi.create(
          payload
        );

        setSuccess(
          "Assignment created successfully"
        );
      }

      setAssignmentForm({
        course: "",
        title: "",
        description: "",
        dueDate: "",
        maximumMarks: 100,
      });

      setEditingAssignmentId(null);

      await LoadAssignments();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to save assignment"
      );
    }
  };

  const HandleAssignmentEdit = (
    assignment
  ) => {
    setEditingAssignmentId(
      assignment._id
    );

    setAssignmentForm({
      course:
        assignment.course?._id ||
        assignment.course ||
        "",
      title:
        assignment.title || "",
      description:
        assignment.description || "",
      dueDate:
        assignment.dueDate
          ? assignment.dueDate.slice(
              0,
              10
            )
          : "",
      maximumMarks:
        assignment.maximumMarks ||
        100,
    });

    setError("");
    setSuccess("");
  };

  const HandleAssignmentDelete = async (
    assignmentId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this assignment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await AssignmentApi.remove(
        assignmentId
      );

      setSuccess(
        "Assignment deleted successfully"
      );

      await LoadAssignments();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to delete assignment"
      );
    }
  };

  const HandleProgressSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const payload = {
        student:
          progressForm.student,
        course:
          progressForm.course,
        progressPercentage:
          Number(
            progressForm.progressPercentage
          ),
        lastAccessedAt:
          new Date(),
      };

      if (editingProgressId) {
        await ProgressApi.update(
          editingProgressId,
          payload
        );

        setSuccess(
          "Progress updated successfully"
        );
      } else {
        await ProgressApi.create(
          payload
        );

        setSuccess(
          "Progress created successfully"
        );
      }

      setProgressForm({
        student: "",
        course: "",
        progressPercentage: 0,
      });

      setEditingProgressId(null);

      await LoadProgress();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to save progress"
      );
    }
  };

  const HandleProgressEdit = (
    progress
  ) => {
    setEditingProgressId(
      progress._id
    );

    setProgressForm({
      student:
        progress.student?._id ||
        progress.student ||
        "",
      course:
        progress.course?._id ||
        progress.course ||
        "",
      progressPercentage:
        progress.progressPercentage || 0,
    });

    setError("");
    setSuccess("");
  };

  const HandleProgressDelete = async (
    progressId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this progress record?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await ProgressApi.remove(
        progressId
      );

      setSuccess(
        "Progress deleted successfully"
      );

      await LoadProgress();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to delete progress"
      );
    }
  };

  const HandleDelete =
    async (courseId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this course?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        await CourseApi.remove(
          courseId
        );

        setSuccess(
          "Course deleted successfully"
        );

        if (
          editingCourseId === courseId
        ) {
          ResetForm();
        }

        await LoadCourses();
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to delete course"
        );
      }
    };

  return (
    <main className="page-shell">
      <section className="dashboard-header">
        <div>
          <span className="eyebrow">
            Instructor Portal
          </span>

          <h1>
            Manage your learning content
          </h1>

          <p>
            Create, update and publish
            teaching content.
          </p>
        </div>
      </section>

      <section className="instructor-layout">
        <article className="content-card">
          <div className="card-heading">
            <h2>
              {editingCourseId
                ? "Edit Course"
                : "Create Course"}
            </h2>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              {success}
            </div>
          )}

          <form
            className="course-form"
            onSubmit={HandleSubmit}
          >
            <div className="form-group">
              <label>
                Course title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={HandleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={HandleChange}
                rows="5"
              />
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="published"
                checked={
                  form.published
                }
                onChange={HandleChange}
              />

              Published
            </label>

            <div className="form-action-row">
              <button
                className="primary-button action-button"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingCourseId
                    ? "Update Course"
                    : "Create Course"}
              </button>

              {editingCourseId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={ResetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="content-card">
          <div className="card-heading">
            <h2>Your Courses</h2>
          </div>

          {loading ? (
            <p>
              Loading courses...
            </p>
          ) : courses.length === 0 ? (
            <p>
              No courses have been created yet.
            </p>
          ) : (
            <div className="instructor-course-list">
              {courses.map(
                (course) => (
                  <div
                    className="instructor-course-row"
                    key={course._id}
                  >
                    <div>
                      <strong>
                        {course.title}
                      </strong>

                      <span>
                        {course.published
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    <div className="row-actions">
                      <button
                        className="secondary-button"
                        onClick={() =>
                          HandleEdit(
                            course
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          HandleTogglePublish(
                            course
                          )
                        }
                      >
                        {course.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <a
                        className="secondary-button"
                        href={
                          \`/course-details?id=\${course._id}\`
                        }
                      >
                        View
                      </a>

                      {user?.role ===
                        "admin" && (
                        <button
                          className="danger-button"
                          onClick={() =>
                            HandleDelete(
                              course._id
                            )
                          }
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </article>
      </section>

      <section className="content-card module-section">
        <div className="card-heading">
          <h2>
            {editingLessonId
              ? "Edit Lesson"
              : "Create Lesson"}
          </h2>
        </div>


        <form
          className="course-form"
          onSubmit={HandleLessonSubmit}
        >
          <div className="form-group">
            <label>Course</label>


            <select
              name="course"
              value={lessonForm.course}
              onChange={HandleLessonChange}
              required
            >
              <option value="">
                Select a course
              </option>


              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                >
                  {course.title}
                </option>
              ))}
            </select>
          </div>


          <div className="form-group">
            <label>Lesson title</label>


            <input
              name="title"
              value={lessonForm.title}
              onChange={HandleLessonChange}
              required
            />
          </div>


          <div className="form-group">
            <label>Content</label>


            <textarea
              name="content"
              value={lessonForm.content}
              onChange={HandleLessonChange}
              rows="5"
            />
          </div>


          <div className="form-group">
            <label>Video URL</label>


            <input
              name="videoUrl"
              value={lessonForm.videoUrl}
              onChange={HandleLessonChange}
            />
          </div>


          <div className="form-group">
            <label>Order</label>


            <input
              type="number"
              name="order"
              value={lessonForm.order}
              onChange={HandleLessonChange}
              min="0"
            />
          </div>


          <div className="form-action-row">
            <button className="primary-button action-button">
              {editingLessonId
                ? "Update Lesson"
                : "Create Lesson"}
            </button>


            {editingLessonId && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingLessonId(null);
                  setLessonForm({
                    course: "",
                    title: "",
                    content: "",
                    videoUrl: "",
                    order: 0,
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>


      <section className="content-card module-section">
        <div className="card-heading">
          <h2>Lessons</h2>
        </div>


        {lessons.length === 0 ? (
          <p>
            No lessons have been created yet.
          </p>
        ) : (
          <div className="instructor-course-list">
            {lessons.map((lesson) => (
              <div
                className="instructor-course-row"
                key={lesson._id}
              >
                <div>
                  <strong>
                    {lesson.title}
                  </strong>


                  <span>
                    Order: {lesson.order}
                  </span>
                </div>


                <div className="row-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      HandleLessonEdit(
                        lesson
                      )
                    }
                  >
                    Edit
                  </button>


                  {user?.role === "admin" && (
                    <button
                      className="danger-button"
                      onClick={() =>
                        HandleLessonDelete(
                          lesson._id
                        )
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="content-card module-section">
        <div className="card-heading">
          <h2>
            {editingQuizId
              ? "Edit Quiz"
              : "Create Quiz"}
          </h2>
        </div>

        <form
          className="course-form"
          onSubmit={HandleQuizSubmit}
        >
          <div className="form-group">
            <label>Course</label>

            <select
              name="course"
              value={quizForm.course}
              onChange={HandleQuizChange}
              required
            >
              <option value="">
                Select a course
              </option>

              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                >
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quiz title</label>

            <input
              name="title"
              value={quizForm.title}
              onChange={HandleQuizChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Passing score</label>

            <input
              type="number"
              name="passingScore"
              value={quizForm.passingScore}
              onChange={HandleQuizChange}
              min="0"
              max="100"
            />
          </div>

          <div className="form-action-row">
            <button
              className="primary-button action-button"
              type="submit"
            >
              {editingQuizId
                ? "Update Quiz"
                : "Create Quiz"}
            </button>


            {editingQuizId && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingQuizId(null);


                  setQuizForm({
                    course: "",
                    title: "",
                    passingScore: 50,
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>


      <section className="content-card module-section">
        <div className="card-heading">
          <h2>Quizzes</h2>
        </div>


        {quizzes.length === 0 ? (
          <p>
            No quizzes have been created yet.
          </p>
        ) : (
          <div className="instructor-course-list">
            {quizzes.map((quiz) => (
              <div
                className="instructor-course-row"
                key={quiz._id}
              >
                <div>
                  <strong>
                    {quiz.title}
                  </strong>


                  <span>
                    Passing score:{" "}
                    {quiz.passingScore}%
                  </span>
                </div>


                <div className="row-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      HandleQuizEdit(
                        quiz
                      )
                    }
                  >
                    Edit
                  </button>


                  {user?.role === "admin" && (
                    <button
                      className="danger-button"
                      onClick={() =>
                        HandleQuizDelete(
                          quiz._id
                        )
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="content-card module-section">
        <div className="card-heading">
          <h2>
            {editingAssignmentId
              ? "Edit Assignment"
              : "Create Assignment"}
          </h2>
        </div>

        <form
          className="course-form"
          onSubmit={HandleAssignmentSubmit}
        >
          <div className="form-group">
            <label>Course</label>

            <select
              name="course"
              value={assignmentForm.course}
              onChange={HandleAssignmentChange}
              required
            >
              <option value="">
                Select a course
              </option>

              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                >
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assignment title</label>

            <input
              name="title"
              value={assignmentForm.title}
              onChange={HandleAssignmentChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={assignmentForm.description}
              onChange={HandleAssignmentChange}
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Due date</label>

            <input
              type="date"
              name="dueDate"
              value={assignmentForm.dueDate}
              onChange={HandleAssignmentChange}
            />
          </div>

          <div className="form-group">
            <label>Maximum marks</label>

            <input
              type="number"
              name="maximumMarks"
              value={assignmentForm.maximumMarks}
              onChange={HandleAssignmentChange}
              min="0"
            />
          </div>

          <div className="form-action-row">
            <button
              className="primary-button action-button"
              type="submit"
            >
              {editingAssignmentId
                ? "Update Assignment"
                : "Create Assignment"}
            </button>

            {editingAssignmentId && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingAssignmentId(null);

                  setAssignmentForm({
                    course: "",
                    title: "",
                    description: "",
                    dueDate: "",
                    maximumMarks: 100,
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>


      <section className="content-card module-section">
        <div className="card-heading">
          <h2>Assignments</h2>
        </div>


        {assignments.length === 0 ? (
          <p>
            No assignments have been created yet.
          </p>
        ) : (
          <div className="instructor-course-list">
            {assignments.map(
              (assignment) => (
                <div
                  className="instructor-course-row"
                  key={assignment._id}
                >
                  <div>
                    <strong>
                      {assignment.title}
                    </strong>


                    <span>
                      Max marks:{" "}
                      {assignment.maximumMarks}
                    </span>
                  </div>


                  <div className="row-actions">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        HandleAssignmentEdit(
                          assignment
                        )
                      }
                    >
                      Edit
                    </button>


                    {user?.role === "admin" && (
                      <button
                        className="danger-button"
                        onClick={() =>
                          HandleAssignmentDelete(
                            assignment._id
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="content-card module-section">
        <div className="card-heading">
          <h2>
            {editingProgressId
              ? "Edit Progress"
              : "Create Progress"}
          </h2>
        </div>

        <form
          className="course-form"
          onSubmit={HandleProgressSubmit}
        >
          <div className="form-group">
            <label>Student ID</label>

            <input
              name="student"
              value={progressForm.student}
              onChange={HandleProgressChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Course</label>

            <select
              name="course"
              value={progressForm.course}
              onChange={HandleProgressChange}
              required
            >
              <option value="">
                Select a course
              </option>

              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                >
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Progress percentage</label>

            <input
              type="number"
              name="progressPercentage"
              value={progressForm.progressPercentage}
              onChange={HandleProgressChange}
              min="0"
              max="100"
            />
          </div>

          <div className="form-action-row">
            <button
              className="primary-button action-button"
              type="submit"
            >
              {editingProgressId
                ? "Update Progress"
                : "Create Progress"}
            </button>

            {editingProgressId && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingProgressId(null);

                  setProgressForm({
                    student: "",
                    course: "",
                    progressPercentage: 0,
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="content-card module-section">
        <div className="card-heading">
          <h2>
            Progress Records
          </h2>
        </div>


        {progressRecords.length === 0 ? (
          <p>
            No progress records yet.
          </p>
        ) : (
          <div className="instructor-course-list">
            {progressRecords.map(
              (progress) => (
                <div
                  className="instructor-course-row"
                  key={progress._id}
                >
                  <div>
                    <strong>
                      Progress:{" "}
                      {progress.progressPercentage}%
                    </strong>


                    <span>
                      Student:{" "}
                      {progress.student?._id ||
                        progress.student}
                    </span>
                  </div>


                  <div className="row-actions">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        HandleProgressEdit(
                          progress
                        )
                      }
                    >
                      Edit
                    </button>


                    {user?.role === "admin" && (
                      <button
                        className="danger-button"
                        onClick={() =>
                          HandleProgressDelete(
                            progress._id
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default InstructorPortal;
`;
}


if (componentName === "CourseDetailsPage") {
  return `import React, {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  CourseApi,
} from "../Services/Api";

const CourseDetailsPage = () => {
  const [searchParams] =
    useSearchParams();

  const courseId =
    searchParams.get("id");

  const [course, setCourse] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const LoadCourse = async () => {
      if (!courseId) {
        setError(
          "Course ID was not provided."
        );

        setLoading(false);
        return;
      }

      try {
        const response =
          await CourseApi.getById(
            courseId
          );

        setCourse(
          response.data.data
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load course"
        );
      } finally {
        setLoading(false);
      }
    };

    LoadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-card">
          Loading course...
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="page-shell">
        <div className="form-error">
          {error || "Course not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="course-detail-header">
        <div>
          <span className="eyebrow">
            Course
          </span>

          <h1>
            {course.title}
          </h1>

          <p>
            {course.description ||
              "No course description available."}
          </p>
        </div>

        <div className="course-summary-card">
          <strong>
            {course.published
              ? "Published"
              : "Draft"}
          </strong>

          <span>
            Course Status
          </span>

          <div className="detail-list">
            <div>
              <span>Lessons</span>

              <strong>
                {course.lessons?.length || 0}
              </strong>
            </div>

            <div>
              <span>Students</span>

              <strong>
                {course.students?.length || 0}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="course-detail-grid">
        <article className="content-card">
          <div className="card-heading">
            <h2>
              Course Content
            </h2>
          </div>

          {course.lessons?.length ? (
            <div className="lesson-list">
              {course.lessons.map(
                (lesson, index) => (
                  <div
                    className="lesson-row"
                    key={
                      lesson._id ||
                      lesson
                    }
                  >
                    <div className="lesson-number">
                      {index + 1}
                    </div>

                    <div className="lesson-info">
                      <strong>
                        Lesson {index + 1}
                      </strong>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p>
              No lessons have been
              added to this course yet.
            </p>
          )}
        </article>

        <aside className="content-card">
          <div className="card-heading">
            <h2>
              Course Information
            </h2>
          </div>

          <div className="detail-list">
            <div>
              <span>Status</span>

              <strong>
                {course.published
                  ? "Published"
                  : "Draft"}
              </strong>
            </div>

            <div>
              <span>Lessons</span>

              <strong>
                {course.lessons?.length || 0}
              </strong>
            </div>

            <div>
              <span>Students</span>

              <strong>
                {course.students?.length || 0}
              </strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default CourseDetailsPage;
`;
}

if (componentName === "QuizzesPage") {
  return `import React from "react";

const QuizzesPage = () => {
  const quizzes = [
    {
      title: "Programming Basics",
      course: "Introduction to Programming",
      questions: 10,
      status: "Completed",
      score: "85%",
    },
    {
      title: "JavaScript Fundamentals",
      course: "Web Development Fundamentals",
      questions: 15,
      status: "Available",
      score: "-",
    },
    {
      title: "Database Concepts",
      course: "Database Essentials",
      questions: 12,
      status: "Available",
      score: "-",
    },
  ];

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          Assessments
        </span>

        <h1>Quizzes</h1>

        <p>
          Test your knowledge and review
          assessment results across your courses.
        </p>
      </section>

      <section className="assessment-grid">
        {quizzes.map((quiz) => (
          <article
            className="assessment-card"
            key={quiz.title}
          >
            <div className="assessment-top">
              <span className="course-category">
                {quiz.course}
              </span>

              <span
                className={
                  quiz.status === "Completed"
                    ? "status-complete"
                    : "status-pending"
                }
              >
                {quiz.status}
              </span>
            </div>

            <h3>{quiz.title}</h3>

            <div className="assessment-meta">
              <span>
                {quiz.questions} questions
              </span>

              <span>
                Score: {quiz.score}
              </span>
            </div>

            <button className="secondary-button">
              {quiz.status === "Completed"
                ? "Review Quiz"
                : "Start Quiz"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
};

export default QuizzesPage;
`;
}

if (componentName === "AssignmentsPage") {
  return `import React from "react";

const AssignmentsPage = () => {
  const assignments = [
    {
      title: "Programming Exercise",
      course: "Introduction to Programming",
      due: "Tomorrow",
      status: "Pending",
    },
    {
      title: "Build a React Component",
      course: "Web Development Fundamentals",
      due: "3 days",
      status: "Pending",
    },
    {
      title: "Database Design Task",
      course: "Database Essentials",
      due: "Submitted",
      status: "Completed",
    },
  ];

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          Coursework
        </span>

        <h1>Assignments</h1>

        <p>
          Keep track of upcoming coursework,
          submission status and deadlines.
        </p>
      </section>

      <section className="content-card">
        <div className="assignment-list">
          {assignments.map(
            (assignment) => (
              <div
                className="assignment-row"
                key={assignment.title}
              >
                <div>
                  <strong>
                    {assignment.title}
                  </strong>

                  <span>
                    {assignment.course}
                  </span>
                </div>

                <div className="assignment-meta">
                  <span>
                    {assignment.due}
                  </span>

                  <span
                    className={
                      assignment.status ===
                      "Completed"
                        ? "status-complete"
                        : "status-pending"
                    }
                  >
                    {assignment.status}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
};

export default AssignmentsPage;
`;
}

if (
  componentName ===
  "ProgressTrackingPage"
) {
  return `import React, {
  useEffect,
  useState,
} from "react";

import {
  ProgressApi,
} from "../Services/Api";

import {
  useAuth,
} from "../Context/AuthContext";

const ProgressTrackingPage = () => {
  const { user } = useAuth();

  const [progressRecords, setProgressRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const LoadProgress = async () => {
      try {
        const userId =
          user?.id || user?._id;

        if (!userId) {
          setProgressRecords([]);
          setLoading(false);
          return;
        }

        const progressResponse =
          await ProgressApi.getMine();

        const myProgress =
          progressResponse.data.data || [];

        const ownProgress =
          myProgress.filter(
            (record) => {
              const studentId =
                record.student?._id ||
                record.student;

              return (
                String(studentId) ===
                String(userId)
              );
            }
          );

        setProgressRecords(
          ownProgress
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load progress"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      LoadProgress();
    }
  }, [user]);

  const GetCourseName = (
    course
  ) => {
    return (
      course?.title ||
      course?._id ||
      course ||
      "Course unavailable"
    );
  };

  const averageProgress =
    progressRecords.length > 0
      ? Math.round(
          progressRecords.reduce(
            (total, record) =>
              total +
              Number(
                record.progressPercentage ||
                0
              ),
            0
          ) /
            progressRecords.length
        )
      : 0;

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-card">
          Loading progress...
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          Performance
        </span>

        <h1>
          Learning Progress
        </h1>

        <p>
          Review your current course
          progress and learning activity.
        </p>
      </section>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span>
            Overall Progress
          </span>

          <strong>
            {averageProgress}%
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Courses Tracked
          </span>

          <strong>
            {progressRecords.length}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Completed Courses
          </span>

          <strong>
            {
              progressRecords.filter(
                (record) =>
                  Number(
                    record.progressPercentage
                  ) >= 100
              ).length
            }
          </strong>
        </article>

        <article className="stat-card">
          <span>
            In Progress
          </span>

          <strong>
            {
              progressRecords.filter(
                (record) =>
                  Number(
                    record.progressPercentage
                  ) > 0 &&
                  Number(
                    record.progressPercentage
                  ) < 100
              ).length
            }
          </strong>
        </article>
      </section>

      <section className="content-card progress-card">
        <div className="card-heading">
          <h2>
            Course Progress
          </h2>
        </div>

        {progressRecords.length === 0 ? (
          <p>
            No progress records have
            been added for your account yet.
          </p>
        ) : (
          <div className="progress-course-list">
            {progressRecords.map(
              (record) => (
                <div
                  className="progress-course-row"
                  key={record._id}
                >
                  <div className="progress-course-heading">
                    <strong>
                      {GetCourseName(
                        record.course
                      )}
                    </strong>

                    <span>
                      {
                        record.progressPercentage
                      }%
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width:
                          \`\${Math.min(
                            Math.max(
                              Number(
                                record.progressPercentage ||
                                0
                              ),
                              0
                            ),
                            100
                          )}%\`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default ProgressTrackingPage;
`;
}



  return GenerateGenericPage(
    componentName,
    displayName,
    "LMS"
  );
};

const GenerateGenericPage = (
  componentName,
  displayName,
  appType
) => {
  return `import React from "react";

const ${componentName} = () => {
  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="eyebrow">
          ${appType}
        </span>

        <h1>${displayName}</h1>

        <p>
          Manage and explore ${displayName.toLowerCase()}
          from your generated application.
        </p>
      </section>
    </main>
  );
};

export default ${componentName};
`;
};


module.exports = {
  GenerateFrontendFiles,
  NormalizeComponentName,
  GeneratePageComponent,
  GenerateLmsPage,
  GenerateGenericPage,
};
