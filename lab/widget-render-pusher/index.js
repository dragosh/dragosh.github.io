/**
 * ------------------------------------------------------------------------
 * Widget RenderConf Pusher
 * ------------------------------------------------------------------------
 */
'use strict';

import bucket from './scripts/bucket';
import Webcam from './scripts/webcam';

const pusher = new Pusher('087e104eb546157304a9', { cluster: 'eu' });
const button = pusher.subscribe('button');

const shutter = document.getElementById('shutter');
const sound = document.getElementById('sound');
const gallery = document.getElementById('gallery');

// const test = document.getElementById('test');
// test.addEventListener('click', function() {
//     var data = {
//         id: bucket.makeid()
//     };
//     take_snapshot(data);
// }, false)

function take_snapshot(data) {
    console.log(data, 'Button data');
    shutter.setAttribute('class', 'on');
    sound.play();
    setTimeout(function() {
        shutter.setAttribute('class', '');
    }, 30 * 2 + 45); /* Shutter speed (double & add 45) */
    // take snapshot and get image data
    Webcam.snap(function(data_uri) {
        bucket.put(data.id, data_uri).then(() => {
            refresh(data.id);
        })
    });

}

function refresh(id) {
    console.log('list', id);
    bucket.list(id).then(function(data) {
        return Promise.all(
            data.map(function(uri) {
                return window.fetch(uri).then(function(response) {
                    return response.text();
                });
            })
        )
    }).then(images => {
        return images.map(uri => {
            var i = document.createElement('img');
            i.setAttribute('src', uri);
            i.setAttribute('width', 320);
            i.setAttribute('height', 240);
            i.setAttribute('class', 'pic');
            return i;
        })
    }).then(images => {
        var first = gallery.childNodes[0];
        var group = document.createElement('hr');
        if (first) {
            gallery.insertBefore(group, first);
        } else {
            gallery.appendChild(group);
        }
        images.forEach(i => {
            console.log(gallery);
            console.log(i);
            console.log(group);
            gallery.insertBefore(i, group);
            // document.body.appendChild(i)
        });

    }).catch(err => {
        console.log(err);
    })
}


button.bind('press', function(data) {
    take_snapshot(data);
})


Webcam.set({
    width: 320,
    height: 240,
    image_format: 'jpeg',
    jpeg_quality: 90
});
Webcam.attach('#my_camera');
