'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
      },
      auth_provider: {
        type: Sequelize.ENUM('local', 'google'),
        defaultValue: 'local',
      },
      google_id: {
        type: Sequelize.STRING(255),
        unique: true,
      },
      role: {
        type: Sequelize.ENUM('Student', 'Staff', 'Admin'),
        defaultValue: 'Student',
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected', 'Deactivated'),
        defaultValue: 'Pending',
      },
      student_staff_id: {
        type: Sequelize.STRING(30),
      },
      class_name: {
        type: Sequelize.STRING(100),
      },
      department: {
        type: Sequelize.STRING(150),
      },
      joined_date: {
        type: Sequelize.DATEONLY,
      },
      ui_theme: {
        type: Sequelize.ENUM('light', 'dark'),
        defaultValue: 'light',
      },
      avatar_url: {
        type: Sequelize.STRING(500),
      },
      reject_reason: {
        type: Sequelize.TEXT,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_verify_token: {
        type: Sequelize.STRING(255),
      },
      reset_password_token: {
        type: Sequelize.STRING(255),
      },
      reset_password_expires: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('faqs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(100),
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('badges', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      icon_emoji: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      condition_type: {
        type: Sequelize.ENUM('SURVEY_COUNT', 'PARTICIPATION_COUNT', 'TOTAL_POINTS', 'LEADERBOARD_RANK', 'ECO_SURVEY_COUNT', 'HIGH_RATING_COUNT'),
        allowNull: false,
      },
      condition_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.createTable('surveys', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      target_role: {
        type: Sequelize.ENUM('All', 'Student', 'Staff'),
        defaultValue: 'All',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Published', 'Closed'),
        defaultValue: 'Draft',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('questions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      survey_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'surveys',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      question_type: {
        type: Sequelize.ENUM('Text', 'Single_Choice', 'Multiple_Choice'),
        defaultValue: 'Text',
      },
      options: {
        type: Sequelize.JSON,
      },
      order_num: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('participations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      event_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      participant_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending',
      },
      ai_summary: {
        type: Sequelize.TEXT,
      },
      reject_reason: {
        type: Sequelize.TEXT,
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reviewed_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('participation_files', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      participation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'participations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_type: {
        type: Sequelize.STRING(100),
      },
      file_size: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('point_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      action_type: {
        type: Sequelize.ENUM('Survey_Completion', 'Event_Report', 'Bonus', 'Deduction'),
        allowNull: false,
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reference_id: {
        type: Sequelize.INTEGER,
      },
      reference_type: {
        type: Sequelize.STRING(50),
      },
      note: {
        type: Sequelize.STRING(255),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      reference_type: {
        type: Sequelize.STRING(50),
      },
      reference_id: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('survey_responses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      survey_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'surveys',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      submitted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      opinion_score: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
    });

    await queryInterface.createTable('survey_answers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      response_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'survey_responses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      answer_text: {
        type: Sequelize.TEXT,
      },
    });

    await queryInterface.createTable('user_badges', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      badge_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'badges',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      earned_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_badges');
    await queryInterface.dropTable('survey_answers');
    await queryInterface.dropTable('survey_responses');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('point_logs');
    await queryInterface.dropTable('participation_files');
    await queryInterface.dropTable('participations');
    await queryInterface.dropTable('questions');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('surveys');
    await queryInterface.dropTable('badges');
    await queryInterface.dropTable('faqs');
    await queryInterface.dropTable('users');
  }
};