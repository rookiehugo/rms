var dbHelper = require('../models/dbHelper');

module.exports = {

    loginCheck: function(req, res, next) {
        if (req.session.userId) {
            return next();
        }
        res.redirect('/login');
    },

    login: function(req, res) {
        var errMessage = req.session.errMessage || '';
        req.session.errMessage = '';
        res.render('login', {
            errMessage: errMessage,
            email: req.cookies.email || '',
            password: req.cookies.password || ''
        });
    },

    loginHandle: function(req, res) {
        var email = req.body.email || '';
        var password = req.body.password || '';
        if (req.body.remember_me) {
            res.cookie('email', email, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true
            });
            res.cookie('password', password, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true
            });
        }
        dbHelper.login(email, password, function(err, user) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                if (user) {
                    req.session.userId = user.id;
                    req.session.userEmail = user.email;
                    res.redirect('/resumes');
                } else {
                    req.session.errMessage = 'The username or password you entered is incorrect.';
                    res.redirect('/login');
                }
            }
        });
    },

    signUp: function(req, res) {
        var errMessage = req.session.errMessage || '';
        req.session.errMessage = '';
        res.render('sign-up', {
            errMessage: errMessage
        });
    },

    signUpHandle: function(req, res) {
        var email = req.body.email || '';
        var password = req.body.password || '';
        var name = req.body.name || '';
        dbHelper.signUp(email, password, name, function(err, userId) {
            if (err) {
                console.log(err);
                //email唯一，导致错误
                req.session.errMessage = 'email existed！';
                res.redirect('/sign_up');
            } else {
                if (userId) {
                    req.session.userId = userId;
                    res.redirect('/resumes');
                } else {
                    res.redirect('/sign_up');
                }
            }
        });
    },

    // &.ajax
    // loginHandle: function(req, res) {
    //     var email = req.body.email || "";
    //     var password = req.body.password || "";
    //     var existFlag = false;
    //     dbHelper.login(email, password, function(err, userId) {
    //         if (err) {
    //             console.log(err);
    //             res.send('Server error!');
    //         } else {
    //             if (userId) {
    //                 req.session.userId = userId;
    //                 existFlag = true;
    //                 res.send(existFlag);
    //             } else {
    //                 res.send(existFlag);
    //             }
    //         }
    //     });
    // },

    logout: function(req, res) {
        req.session.userId = 0;
        req.session.userEmail = '';
        res.redirect('/login');
    },

    changePassword: function(req, res) {
        var errMessage = req.session.errMessage || '';
        req.session.errMessage = '';
        res.render('password', {
            email: req.session.userEmail,
            errMessage: errMessage
        });
    },

    changePasswordHandle: function(req, res) {
        var oldPassword = req.body.old_password || '';
        var newPassword = req.body.new_password || '';
        dbHelper.changePassword(req.session.userId, oldPassword, newPassword, function(err, oldPasswordRight) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                if (oldPasswordRight) {
                    res.redirect('/resumes');
                } else {
                    req.session.errMessage = "old password is incorrect！";
                    res.redirect('/password');
                }
            }
        });
    },

    showNewResumePage: function(req, res) {
        res.render('new-resume', {
            userId: req.session.userId
        });
    },

    addNewResume: function(req, res) {
        var userId = req.session.userId;
        var newResume = getNewResume(req, res);
        dbHelper.addNewResume(userId, newResume, function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/resumes');
            }
        });
    },

    showResumeList: function(req, res) {
        dbHelper.showResumeList(req.session.userId, function(err, user, resumeList, existFlag) {
            if (err) {
                console.log(err);
            } else {
                res.render('resume-list', {
                    resumeList: resumeList,
                    user: user
                });
            }
        });
    },

    viewResume: function(req, res) {
        var userId = req.session.userId;
        var resumeId = req.params.id || '';
        dbHelper.showResumeInfo(userId, resumeId, function(err, allInfo, existFlag) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                if (existFlag) {
                    res.render('show-resume', {
                        allInfo: allInfo
                    });
                } else {
                    res.redirect('/resumes');
                }
            }
        });
    },

    deleteResume: function(req, res) {
        var resumeId = req.params.id || '';
        dbHelper.deleteResume(resumeId, function(err) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                res.send('Delete successfully!');
            }
        });
    },

    editResumeBasic: function(req, res) {
        var resumeId = req.params.id || '';
        var newResume = getNewResumeBasic(req, res);
        dbHelper.editResumeBasic(resumeId, newResume, function(err) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                res.redirect('/resumes/' + resumeId);
            }
        });
    },

    editEducation: function(req, res) {
        var newEducation = getNewEducation(req, res);
        var resumeId = req.params.resume_id || '';
        var educationId = req.params.id || '';
        dbHelper.editEducation(educationId, newEducation, function(err) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                res.redirect('/resumes/' + resumeId);
            }
        });
    },

    addEducation: function(req, res) {
        var newEducation = getNewEducation(req, res);
        var resumeId = req.params.resume_id || '';
        dbHelper.addEducation(resumeId, newEducation, function(err) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                res.redirect('/resumes/' + resumeId);
            }
        })
    },

    deleteEducation: function(req, res) {
        var id = req.params.id || '';
        var resumeId = req.params.resume_id || '';
        dbHelper.deleteEducation(id, function(err) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                res.send('Delete successfully!');
            }
        });
    },


    editProject: function(req, res) {
        var newProject = getNewProject(req, res);
        var resumeId = req.params.resume_id || '';
        var projectId = req.params.id || '';
        dbHelper.editProject(projectId, newProject, function(err) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                res.redirect('/resumes/' + resumeId);
            }
        });
    },

    addProject: function(req, res) {
        var newProject = getNewProject(req, res);
        var resumeId = req.params.resume_id || '';
        dbHelper.addProject(resumeId, newProject, function(err) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                res.redirect('/resumes/' + resumeId);
            }
        });
    },

    deleteProject: function(req, res) {
        var id = req.params.id || '';
        var resumeId = req.params.resume_id || '';
        dbHelper.deleteProject(id, function(err) {
            if (err) {
                console.log(err);
                res.send('Server error!');
            } else {
                res.send('Delete successfully!');
            }
        });
    },
};

function getNewEducation(req, res) {
    var university = req.body.edit_university || '';
    var periodFrom = req.body.edit_university_period_from || '';
    var periodTo = req.body.edit_university_period_to || '';
    var major = req.body.edit_university_major || '';
    var newEducation = {
        school: university,
        range: periodFrom + '-' + periodTo,
        major: major,
    };
    return newEducation;
};

function getNewProject(req, res) {
    var company = req.body.edit_company || '';
    var periodFrom = req.body.edit_company_period_from || '';
    var periodTo = req.body.edit_company_period_to || '';
    var description = req.body.edit_company_description || '';
    var newProject = {
        company: company,
        range: periodFrom + '-' + periodTo,
        description: description,
    };
    return newProject;
};

function getNewResumeBasic(req, res) {
    var newResume = {
        name: req.body.resume_name || '',
        age: req.body.age || '',
        email: req.body.email || '',
        gender: req.body.genderRadios || '',
        address: req.body.address || ''
    };
    return newResume;
};

function getNewResume(req, res) {
    var newResumeBasic = getNewResumeBasic(req, res);

    var company = req.body.company || '';
    var companyPeriodFrom = req.body.company_period_from || '';
    var companyPeriodTo = req.body.company_period_to || '';
    var description = req.body.company_description || '';
    var newProject = {
        company: company,
        range: companyPeriodFrom + '-' + companyPeriodTo,
        description: description,
    };

    var university = req.body.university || '';
    var universityPeriodFrom = req.body.university_period_from || '';
    var universityPeriodTo = req.body.university_period_to || '';
    var major = req.body.university_major || '';
    var newEducation = {
        school: university,
        range: universityPeriodFrom + '-' + universityPeriodTo,
        major: major,
    };

    var newResume = {
        basicInfo: newResumeBasic,
        project: newProject,
        education: newEducation
    };
    return newResume;
}