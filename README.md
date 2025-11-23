# Factory Simulation Web Application

![Factory Simulation](https://img.shields.io/badge/Status-Active-brightgreen)

A **full-stack Flask web application** for simulating factory operations with dedicated Admin and Operator dashboards. This project demonstrates authentication, machine management, operational logging, and activity tracking.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [Connect with Me](#connect-with-me)

---

## Overview

This application is designed for a **factory simulation** environment.  
Admins can manage machines and operators, monitor machine status, and view system-wide activity logs.  
Operators can start/end shifts, report machine issues, log breaks, and calibrate machines.

---

## Features

### Admin Dashboard
- Add, edit, and monitor machines (status: Running/Down)
- Manage operator accounts
- View system-wide activity feed

### Operator Dashboard
- Start and end shifts
- Log breaks and machine issues
- Calibrate machines
- View personal activity log

### Authentication
- Secure login and signup with **Flask-Bcrypt**
- Role-based access control (Admin / Operator)

---

## Technologies Used

- **Backend:** Python, Flask, SQLAlchemy
- **Database:** SQLite
- **Frontend:** HTML, CSS, JavaScript
- **Dependencies:** Flask-Bcrypt, Werkzeug, Colorama, Click, Blinker

---

## Project Structure
AppSoftF-Project/
│
├─ backend/
│ ├─ templates/ # HTML templates (Admin & Operator dashboards, login, signup)
│ ├─ static/ # JS, CSS files
│ └─ models.py # SQLAlchemy models (Operator, Machine, Log)
│
├─ instance/
│ └─ site.db # SQLite database
│
├─ venv/ # Python virtual environment
└─ README.md
