'use strict';

const async = require('async');
const expect = require('chai').expect;
const Serializer = require('../index');
const _ = require('lodash');

describe('deserialize', function() {
    it('should deserialize the payload successfully', function(done) {
        async.parallel([
            function(fn) {
                async.waterfall([
                    function(_fn) {
                        let serializer = new Serializer();
                        async.parallel([
                            function(__fn) {
                                serializer.define('photos', {}, __fn);
                            },

                            function(__fn) {
                                serializer.define('people', {
                                    id: '_id'
                                }, __fn);
                            }
                        ], function(err) {
                            if (err) {
                                return _fn(err);
                            }
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let payload = {
                            data: {
                                type: 'photos',
                                attributes: {
                                    title: 'Ember Hamster',
                                    src: 'http://example.com/images/productivity.png'
                                },
                                relationships: {
                                    photographer: {
                                        data: {
                                            type: 'people',
                                            id: '9'
                                        }
                                    }
                                }
                            }
                        };
                        serializer.deserialize(payload, function(err, data) {
                            expect(err).to.not.exist;
                            expect(data).to.be.an('object');
                            expect(data).to.have.property('photos').that.is.an('object');
                            expect(data.photos).to.have.all.keys('title', 'src', 'photographer');
                            expect(data.photos.photographer).to.be.an('object').with.property('_id', '9');
                            expect(data).to.have.property('people').that.is.an('object');
                            expect(data.people).to.have.property('_id', '9');
                            _fn(err);
                        });
                    }
                ], fn);
            },

            function(fn) {
                async.waterfall([
                    function(_fn) {
                        let serializer = new Serializer();
                        async.parallel([
                            function(__fn) {
                                serializer.define('photos', {}, __fn);
                            },

                            function(__fn) {
                                serializer.define('people', {
                                    id: '_id'
                                }, __fn);
                            }
                        ], function(err) {
                            if (err) {
                                return _fn(err);
                            }
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let payload = {
                            data: [{
                                type: 'photos',
                                attributes: {
                                    title: 'Ember Hamster',
                                    src: 'http://example.com/images/productivity.png'
                                },
                                relationships: {
                                    photographer: {
                                        data: {
                                            type: 'people',
                                            id: '9'
                                        }
                                    }
                                }
                            }, {
                                type: 'photos',
                                attributes: {
                                    title: 'Sweet Photo',
                                    src: 'http://example.com/images/sweet.png'
                                },
                                relationships: {
                                    photographer: {
                                        data: {
                                            type: 'people',
                                            id: '23'
                                        }
                                    },
                                    likes: {
                                        data: [{
                                            type: 'people',
                                            id: '9'
                                        },{
                                            type: 'people',
                                            id: '43'
                                        }]
                                    }
                                }
                            }]
                        };
                        serializer.deserialize(payload, function(err, data) {
                            expect(err).to.not.exist;
                            expect(data).to.be.an('object');
                            expect(data).to.have.property('photos').that.is.an('array');
                            expect(data.photos[0]).to.have.all.keys('title', 'src', 'photographer');
                            expect(data.photos[0]).to.have.property('photographer').that.is.an('object').with.property('_id', '9');
                            expect(data.photos[0]).to.not.have.property('likes');
                            expect(data.photos[1]).to.have.all.keys('title', 'src', 'photographer', 'likes');
                            expect(data.photos[1]).to.have.property('photographer').that.is.an('object').with.property('_id', '23');
                            expect(data.photos[1]).to.have.property('likes').that.is.an('array').with.lengthOf(2);
                            let likes = _.map(data.photos[1].likes, '_id');
                            ['9', '43'].forEach(function(id) {
                                expect(likes).to.contain(id);
                            });
                            expect(data).to.have.property('people').that.is.an('array').with.lengthOf(3);
                            let people = _.map(data.people, '_id');
                            ['9', '23', '43'].forEach(function(id) {
                                expect(people).to.contain(id);
                            });
                            _fn(err);
                        });
                    }
                ], fn);
            },

            function(fn) {
                async.waterfall([
                    function(_fn) {
                        let serializer = new Serializer();
                        serializer.define('people', {
                            id: '_id'
                        }, function(err) {
                            if (err) {
                                return _fn(err);
                            }
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let payload = {
                            data: {
                                type: 'people',
                                id: '12'
                            }
                        };
                        serializer.deserialize(payload, function(err, data) {
                            expect(err).to.not.exist;
                            expect(data).to.be.an('object').with.property('people');
                            expect(data.people).to.be.an('object').with.property('_id', '12');
                            _fn(err);
                        });
                    }
                ], fn);
            },

            function(fn) {
                async.waterfall([
                    function(_fn) {
                        let serializer = new Serializer();
                        serializer.define('people', {
                            id: '_id'
                        }, function(err) {
                            if (err) {
                                return _fn(err);
                            }
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let payload = {
                            data: null
                        };
                        serializer.deserialize(payload, function(err, data) {
                            expect(err).to.not.exist;
                            expect(data).to.be.an('object');
                            let keys = Object.keys(data);
                            expect(keys).to.have.lengthOf(0);
                            _fn(err);
                        });
                    }
                ], fn);
            },

            function(fn) {
                async.waterfall([
                    function(_fn) {
                        let serializer = new Serializer();
                        serializer.define('people', {
                            id: '_id'
                        }, function(err) {
                            if (err) {
                                return _fn(err);
                            }
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let payload = {
                            data: []
                        };
                        serializer.deserialize(payload, function(err, data) {
                            expect(err).to.not.exist;
                            expect(data).to.be.an('object');
                            let keys = Object.keys(data);
                            expect(keys).to.have.lengthOf(0);
                            _fn(err);
                        });
                    }
                ], fn);
            },

            function(fn) {
                async.waterfall([
                    function(_fn) {
                        let serializer = new Serializer();
                        serializer.define('people', {
                            id: '_id'
                        }, function(err) {
                            if (err) {
                                return _fn(err);
                            }
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let payload = {
                            data: [
                                {type: 'people', id: '2'},
                                {type: 'people', id: '3'}
                            ]
                        };
                        serializer.deserialize(payload, function(err, data) {
                            expect(err).to.not.exist;
                            expect(data).to.be.an('object');
                            expect(data).to.have.property('people').that.is.an('array');
                            expect(data.people).to.eql([{_id: '2'}, {_id: '3'}]);
                            _fn(err);
                        });
                    }
                ], fn);
            }
        ], done);
    });

    it('should error when appropriate', function(done) {
        async.parallel([
            function(fn) {
                async.waterfall([
                    function(_fn) {
                        let serializer = new Serializer();
                        async.parallel([
                            function(__fn) {
                                serializer.define('user', {}, __fn);
                            },
                            function(__fn) {
                                serializer.define('group', {}, __fn);
                            }
                        ], function(err) {
                            if (err) {
                                return _fn(err);
                            }
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let badPayload = {
                            data: {
                                attributes: {
                                    first: 'bob',
                                    last: 'smith'
                                },
                                relationships: {
                                    groups: {
                                        data: [{id: 1}]
                                    }
                                }
                            }
                        };
                        serializer.deserialize(badPayload, function(err) {
                            expect(err).to.exist;
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let badPayload = {
                            meta: {
                                something: 'test',
                                somethingElse: 'test'
                            }
                        };
                        serializer.deserialize(badPayload, function(err) {
                            expect(err).to.exist;
                            _fn(null, serializer);
                        });
                    },

                    function(serializer, _fn) {
                        let badPayload = {
                            data: {
                                type: 'user',
                                attributes: {
                                    first: 'bob',
                                    last: 'smith'
                                },
                                relationships: {
                                    groups: {
                                        data: [{id: 1}]
                                    }
                                }
                            }
                        };
                        serializer.deserialize(badPayload, function(err, data) {
                            expect(err).to.exist;
                            _fn(null, serializer);
                        });
                    }
                ], fn);
            }
        ], done);
    });

    it('should deserialize whole relationships', function(done) {
        let serializer = new Serializer();
        async.waterfall([
            function(fn) {
                let payload = {
                    data: {
                        type: 'email',
                        attributes: {
                            from_email: 'noreply@example.com',
                            from_name: 'Joe Bob',
                            subject: 'Test Email',
                            template_name: 'basic'
                        },
                        relationships: {
                            recipients: {
                                data: [{
                                    id: '1',
                                    type: 'to',
                                    attributes: {
                                        email: 'sam@example.com',
                                        first: 'Sam'
                                    }
                                }, {
                                    id: '2',
                                    type: 'to',
                                    attributes: {
                                        email: 'sue@example.com',
                                        first: 'Sue'
                                    }
                                }, {
                                    id: '1',
                                    type: 'cc',
                                    attributes: {
                                        email: 'william@example.com',
                                        first: 'Bill'
                                    }
                                }]
                            }
                        }
                    }
                };
                serializer.deserialize(payload, function(err, data) {
                    expect(err).to.not.exist;
                    expect(data).to.have.all.keys('email', 'to', 'cc');
                    fn(err);
                });
            }
        ], done);
    });

    it('and nest included relationships', function(done) {
        let serializer = new Serializer({
            deserializeIncludedRelationships: true,
            nestDeserializedRelationships: true
        });
        async.waterfall([
            function(fn) {
                let payload = {
                    data: {
                        type: 'email',
                        attributes: {
                            from_email: 'noreply@example.com',
                            from_name: 'Joe Bob',
                            subject: 'Test Email',
                            template_name: 'basic'
                        },
                        relationships: {
                            recipients: {
                                data: [{
                                    id: '1',
                                    type: 'to'
                                }, {
                                    id: '2',
                                    type: 'to'
                                }, {
                                    id: '1',
                                    type: 'cc'
                                }]
                            }
                        }
                    },
                    included: [{
                        id: '1',
                        type: 'to',
                        attributes: {
                            email: 'sam@example.com',
                            first: 'Sam'
                        }
                    }, {
                        id: '2',
                        type: 'to',
                        attributes: {
                            email: 'sue@example.com',
                            first: 'Sue'
                        }
                    }, {
                        id: '1',
                        type: 'cc',
                        attributes: {
                            email: 'william@example.com',
                            first: 'Bill'
                        }
                    }]
                };
                serializer.deserialize(payload, function(err, data) {
                    expect(err).to.not.exist;
                    expect(data).to.have.all.keys('email', 'to', 'cc');
                    expect(data.email).to.have.property('recipients').that.is.an('array').with.lengthOf(3);

                    let recipients = [
                        {
                            id: '1',
                            email: 'sam@example.com',
                            first: 'Sam'
                        },
                        {
                            id: '2',
                            email: 'sue@example.com',
                            first: 'Sue'
                        },
                        {
                            id: '1',
                            email: 'william@example.com',
                            first: 'Bill'
                        }
                    ];

                    recipients.forEach(function(recipient) {
                        expect(data.email.recipients).to.contain(recipient);
                    });

                    fn(err);
                });
            }
        ], done);
    });

    it('and nest single included relationships into object', function(done) {
        async.waterfall([
            function(_fn) {
                let serializer = new Serializer({
                    deserializeIncludedRelationships: true,
                    nestDeserializedRelationships: true
                });

                async.parallel([
                    function(__fn) {
                        serializer.define('email', {}, __fn);
                    },

                    function(__fn) {
                        serializer.define('to', {}, __fn);
                    }
                ], function(err) {
                    if (err) {
                        return _fn(err);
                    }
                    _fn(null, serializer);
                });
            },

            function(serializer, fn) {
                let payload = {
                    data: {
                        type: 'email',
                        attributes: {
                            from_email: 'noreply@example.com',
                            from_name: 'Joe Bob',
                            subject: 'Test Email',
                            template_name: 'basic'
                        },
                        relationships: {
                            recipients: {
                                data: {
                                    id: '1',
                                    type: 'to'
                                }
                            }
                        }
                    },
                    included: [{
                        id: '1',
                        type: 'to',
                        attributes: {
                            email: 'sam@example.com',
                            first: 'Sam'
                        }
                    }]
                };
                serializer.deserialize(payload, function(err, data) {
                    expect(err).to.not.exist;
                    expect(data).to.have.all.keys('email', 'to');
                    expect(data.email).to.have.property('recipients').that.is.not.an('array');

                    let recipients = [
                        {
                            id: '1',
                            email: 'sam@example.com',
                            first: 'Sam'
                        }
                    ];

                    recipients.forEach(function(recipient) {
                        expect(data.email.recipients).to.contain(recipient);
                    });

                    fn(err);
                });
            }
        ], done);
    });

    it('and nest single included relationships into array', function(done) {
        async.waterfall([
            function(_fn) {
                let serializer = new Serializer({
                    deserializeIncludedRelationships: true,
                    nestDeserializedRelationships: true
                });

                async.parallel([
                    function(__fn) {
                        serializer.define('email', {
                            relationships: {
                                recipients: {
                                    type: 'to',
                                    array: true
                                }
                            }
                        }, __fn);
                    },

                    function(__fn) {
                        serializer.define('to', {}, __fn);
                    }
                ], function(err) {
                    if (err) {
                        return _fn(err);
                    }
                    _fn(null, serializer);
                });
            },

            function(serializer, fn) {
                let payload = {
                    data: {
                        type: 'email',
                        attributes: {
                            from_email: 'noreply@example.com',
                            from_name: 'Joe Bob',
                            subject: 'Test Email',
                            template_name: 'basic'
                        },
                        relationships: {
                            recipients: {
                                data: {
                                    id: '1',
                                    type: 'to'
                                }
                            }
                        }
                    },
                    included: [{
                        id: '1',
                        type: 'to',
                        attributes: {
                            email: 'sam@example.com',
                            first: 'Sam'
                        }
                    }]
                };
                serializer.deserialize(payload, function(err, data) {
                    expect(err).to.not.exist;
                    expect(data).to.have.all.keys('email', 'to');
                    expect(data.email).to.have.property('recipients').that.is.an('array').with.lengthOf(1);

                    let recipients = [
                        {
                            id: '1',
                            email: 'sam@example.com',
                            first: 'Sam'
                        }
                    ];

                    recipients.forEach(function(recipient) {
                        expect(data.email.recipients).to.contain(recipient);
                    });

                    fn(err);
                });
            }
        ], done);
    });
});
