describe("iD.actions.Disconnect", function () {
    describe("#enabled", function () {
        it("returns false for a node shared by less than two ways", function () {
            var graph = iD.Graph({'a': iD.Node()});

            expect(iD.actions.Disconnect('a').enabled(graph)).to.equal(false);
        });

        it("returns true for a node appearing twice in the same way", function () {
            //    a ---- b
            //    |      |
            //    d ---- c
            var graph = iD.Graph({
                'a': iD.Node({id: 'a'}),
                'b': iD.Node({id: 'b'}),
                'c': iD.Node({id: 'c'}),
                'd': iD.Node({id: 'd'}),
                'w': iD.Way({id: 'w', nodes: ['a', 'b', 'c', 'd', 'a']})
            });
            expect(iD.actions.Disconnect('a').enabled(graph)).to.equal(true);
        });

        it("returns true for a node shared by two or more ways", function () {
            //    a ---- b ---- c
            //           |
            //           d
            var graph = iD.Graph({
                    'a': iD.Node({id: 'a'}),
                    'b': iD.Node({id: 'b'}),
                    'c': iD.Node({id: 'c'}),
                    'd': iD.Node({id: 'd'}),
                    '-': iD.Way({id: '-', nodes: ['a', 'b', 'c']}),
                    '|': iD.Way({id: '|', nodes: ['d', 'b']})
                });

            expect(iD.actions.Disconnect('b').enabled(graph)).to.equal(true);
        });
    });

    it("replaces the node with a new node in all but the first way", function () {
        // Situation:
        //    a ---- b ---- c
        //           |
        //           d
        // Split at b.
        //
        // Expected result:
        //    a ---- b ---- c
        //
        //           e
        //           |
        //           d
        //
        var graph = iD.Graph({
                'a': iD.Node({id: 'a'}),
                'b': iD.Node({id: 'b'}),
                'c': iD.Node({id: 'c'}),
                'd': iD.Node({id: 'd'}),
                '-': iD.Way({id: '-', nodes: ['a', 'b', 'c']}),
                '|': iD.Way({id: '|', nodes: ['d', 'b']})
            });

        graph = iD.actions.Disconnect('b', 'e')(graph);

        expect(graph.entity('-').nodes).to.eql(['a', 'b', 'c']);
        expect(graph.entity('|').nodes).to.eql(['d', 'e']);
    });

    it("replaces later occurrences in a self-intersecting way", function() {
        // Situtation:
        //  a ---- b
        //   \_    |
        //     \__ c
        //  Split at a
        //
        // Expected result:
        //  a ---- b ---- c ---- d
        var graph = iD.Graph({
                'a': iD.Node({id: 'a'}),
                'b': iD.Node({id: 'b'}),
                'c': iD.Node({id: 'c'}),
                'w': iD.Way({id: 'w', nodes: ['a', 'b', 'c', 'a']})
        });
        graph = iD.actions.Disconnect('a', 'd')(graph);
        expect(graph.entity('w').nodes).to.eql(['a', 'b', 'c', 'd']);
    });

    it("copies location and tags to the new nodes", function () {
        var tags  = {highway: 'traffic_signals'},
            loc   = [1, 2],
            graph = iD.Graph({
                'a': iD.Node({id: 'a'}),
                'b': iD.Node({id: 'b', loc: loc, tags: tags}),
                'c': iD.Node({id: 'c'}),
                'd': iD.Node({id: 'd'}),
                '-': iD.Way({id: '-', nodes: ['a', 'b', 'c']}),
                '|': iD.Way({id: '|', nodes: ['d', 'b']})
            });

        graph = iD.actions.Disconnect('b', 'e')(graph);

        // Immutable loc => should be shared by identity.
        expect(graph.entity('b').loc).to.equal(loc);
        expect(graph.entity('e').loc).to.equal(loc);

        // Immutable tags => should be shared by identity.
        expect(graph.entity('b').tags).to.equal(tags);
        expect(graph.entity('e').tags).to.equal(tags);
    });
});
